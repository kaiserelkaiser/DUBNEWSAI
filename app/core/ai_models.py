from __future__ import annotations

import re
from collections import Counter
from functools import lru_cache
from typing import Any

from loguru import logger

try:
    import torch
except ImportError:  # pragma: no cover - optional dependency
    torch = None

try:
    from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
except ImportError:  # pragma: no cover - optional dependency
    AutoModelForSequenceClassification = None
    AutoTokenizer = None
    pipeline = None

try:
    import spacy
except ImportError:  # pragma: no cover - optional dependency
    spacy = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
except ImportError:  # pragma: no cover - optional dependency
    TfidfVectorizer = None


class AIModels:
    """Singleton manager for optional AI pipelines and NLP helpers."""

    _instance: AIModels | None = None

    def __new__(cls) -> AIModels:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return

        self.sentiment_analyzer = None
        self.financial_sentiment_analyzer = None
        self.classifier = None
        self.nlp = None
        self._initialization_attempted = False
        self._initialized = True

    def _ensure_initialized(self) -> None:
        if self._initialization_attempted:
            return

        self._initialization_attempted = True
        logger.info("Initializing AI models")

        device = 0 if torch is not None and torch.cuda.is_available() else -1

        if pipeline is None:
            logger.warning("transformers is not installed. Falling back to rule-based AI analysis.")
        else:
            try:
                self.sentiment_analyzer = pipeline(
                    "sentiment-analysis",
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    device=device,
                )
            except Exception as exc:  # pragma: no cover - runtime dependency/network dependent
                logger.warning("Could not load general sentiment model: {}", str(exc))

            try:
                if AutoTokenizer is not None and AutoModelForSequenceClassification is not None:
                    tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
                    model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
                    self.financial_sentiment_analyzer = pipeline(
                        "sentiment-analysis",
                        model=model,
                        tokenizer=tokenizer,
                        device=device,
                    )
                else:
                    self.financial_sentiment_analyzer = pipeline(
                        "sentiment-analysis",
                        model="ProsusAI/finbert",
                        device=device,
                    )
            except Exception as exc:  # pragma: no cover - runtime dependency/network dependent
                logger.warning("Could not load financial sentiment model: {}", str(exc))

            try:
                self.classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    device=device,
                )
            except Exception as exc:  # pragma: no cover - runtime dependency/network dependent
                logger.warning("Could not load zero-shot classifier: {}", str(exc))

        if spacy is None:
            logger.warning("spaCy is not installed. Entity extraction will use a lightweight fallback.")
        else:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except Exception as exc:  # pragma: no cover - runtime dependency dependent
                logger.warning(
                    "spaCy model en_core_web_sm is unavailable. Run `python -m spacy download en_core_web_sm`. {}",
                    str(exc),
                )

        logger.info("AI model initialization finished")

    @staticmethod
    def _deduplicate(values: list[str]) -> list[str]:
        seen: set[str] = set()
        deduped: list[str] = []
        for value in values:
            normalized = value.strip()
            if normalized and normalized.lower() not in seen:
                deduped.append(normalized)
                seen.add(normalized.lower())
        return deduped

    @staticmethod
    def _rule_based_sentiment(text: str) -> dict[str, Any]:
        lowered_words = set(re.findall(r"[a-zA-Z]+", text.lower()))
        positive_terms = {"growth", "surge", "record", "strong", "increase", "boom", "demand", "profit", "gain"}
        negative_terms = {"decline", "drop", "risk", "fall", "slowdown", "concern", "loss", "crisis", "debt"}

        positive_score = len(lowered_words & positive_terms)
        negative_score = len(lowered_words & negative_terms)
        raw_score = positive_score - negative_score
        sentiment_score = max(-100, min(100, raw_score * 20))
        confidence = min(1.0, max(0.2, abs(raw_score) * 0.2))

        if sentiment_score > 10:
            sentiment = "positive"
        elif sentiment_score < -10:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        return {
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "confidence": round(confidence, 4),
        }

    @staticmethod
    def _fallback_entities(text: str) -> dict[str, list[str]]:
        lowered = text.lower()
        entities = {
            "persons": [],
            "organizations": [],
            "locations": [],
            "money": re.findall(r"(?:AED|USD|EUR)\s?[\d,]+(?:\.\d+)?", text),
            "dates": re.findall(
                r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,\s+\d{4})?\b",
                text,
                flags=re.IGNORECASE,
            ),
            "other": [],
        }

        known_organizations = [
            "Emaar",
            "Damac",
            "Aldar",
            "Nakheel",
            "Sobha",
            "Azizi",
            "Meraas",
            "Dubai Properties",
            "RERA",
            "Dubai Land Department",
        ]
        known_locations = ["Dubai", "Abu Dhabi", "UAE", "United Arab Emirates", "Emirates"]

        for organization in known_organizations:
            if organization.lower() in lowered:
                entities["organizations"].append(organization)

        for location in known_locations:
            if location.lower() in lowered:
                entities["locations"].append(location)

        for key, values in entities.items():
            entities[key] = AIModels._deduplicate(values)

        return entities

    @staticmethod
    def _fallback_keywords(text: str, top_n: int) -> list[str]:
        words = re.findall(r"[a-zA-Z][a-zA-Z-]{2,}", text.lower())
        stop_words = {
            "about",
            "after",
            "before",
            "their",
            "there",
            "these",
            "those",
            "with",
            "from",
            "that",
            "this",
            "have",
            "will",
            "into",
            "would",
            "could",
            "should",
            "them",
            "they",
            "said",
            "says",
            "news",
            "report",
        }
        counts = Counter(word for word in words if word not in stop_words)
        return [word for word, _ in counts.most_common(top_n)]

    def analyze_sentiment(self, text: str, use_financial: bool = True) -> dict[str, Any]:
        self._ensure_initialized()

        try:
            cleaned_text = (text or "").strip()[:512]
            if not cleaned_text:
                return {"sentiment": "neutral", "sentiment_score": 0, "confidence": 0.0}

            analyzer = self.financial_sentiment_analyzer if use_financial else self.sentiment_analyzer
            analyzer = analyzer or self.sentiment_analyzer
            if analyzer is None:
                return self._rule_based_sentiment(cleaned_text)

            result = analyzer(cleaned_text)[0]
            label = str(result["label"]).lower()
            score = float(result["score"])

            if "positive" in label:
                sentiment = "positive"
                sentiment_score = int(score * 100)
            elif "negative" in label:
                sentiment = "negative"
                sentiment_score = int(-score * 100)
            else:
                sentiment = "neutral"
                sentiment_score = 0

            return {
                "sentiment": sentiment,
                "sentiment_score": sentiment_score,
                "confidence": score,
            }
        except Exception as exc:
            logger.error("Error during sentiment analysis: {}", str(exc))
            return self._rule_based_sentiment(text)

    def extract_entities(self, text: str) -> dict[str, list[str]]:
        self._ensure_initialized()

        if not text:
            return {
                "persons": [],
                "organizations": [],
                "locations": [],
                "money": [],
                "dates": [],
                "other": [],
            }

        if self.nlp is None:
            return self._fallback_entities(text)

        try:
            doc = self.nlp(text[:1_000_000])
            entities = {
                "persons": [],
                "organizations": [],
                "locations": [],
                "money": [],
                "dates": [],
                "other": [],
            }

            for ent in doc.ents:
                entity_text = ent.text.strip()
                if not entity_text:
                    continue

                if ent.label_ == "PERSON":
                    entities["persons"].append(entity_text)
                elif ent.label_ == "ORG":
                    entities["organizations"].append(entity_text)
                elif ent.label_ in {"GPE", "LOC"}:
                    entities["locations"].append(entity_text)
                elif ent.label_ == "MONEY":
                    entities["money"].append(entity_text)
                elif ent.label_ == "DATE":
                    entities["dates"].append(entity_text)
                else:
                    entities["other"].append(entity_text)

            for key, values in entities.items():
                entities[key] = self._deduplicate(values)

            return entities
        except Exception as exc:
            logger.error("Error during entity extraction: {}", str(exc))
            return self._fallback_entities(text)

    def extract_keywords(self, text: str, top_n: int = 10) -> list[str]:
        self._ensure_initialized()

        if not text:
            return []

        if self.nlp is None:
            return self._fallback_keywords(text, top_n)

        try:
            trimmed_text = text[:1_000_000]
            doc = self.nlp(trimmed_text)

            noun_phrases = [chunk.text.lower().strip() for chunk in doc.noun_chunks if len(chunk.text.strip()) > 2]
            important_tokens = [
                token.text.lower()
                for token in doc
                if token.pos_ in {"NOUN", "PROPN"} and not token.is_stop and len(token.text.strip()) > 2
            ]

            tfidf_keywords: list[str] = []
            if TfidfVectorizer is not None:
                vectorizer = TfidfVectorizer(
                    stop_words="english",
                    ngram_range=(1, 2),
                    max_features=max(top_n * 3, 20),
                )
                matrix = vectorizer.fit_transform([trimmed_text[:10_000]])
                features = vectorizer.get_feature_names_out()
                scores = matrix.toarray()[0]
                ranked_indexes = scores.argsort()[::-1]
                tfidf_keywords = [
                    features[index]
                    for index in ranked_indexes
                    if scores[index] > 0
                ]

            combined_keywords = noun_phrases + important_tokens + tfidf_keywords
            keyword_counts = Counter(keyword for keyword in combined_keywords if keyword)
            ranked_keywords = [keyword for keyword, _ in keyword_counts.most_common(top_n * 2)]
            return self._deduplicate(ranked_keywords)[:top_n]
        except Exception as exc:
            logger.error("Error during keyword extraction: {}", str(exc))
            return self._fallback_keywords(text, top_n)

    def categorize_content(self, text: str, categories: list[str]) -> dict[str, Any]:
        self._ensure_initialized()

        if not categories:
            return {"category": "general", "score": 0.0, "all_scores": {}}

        cleaned_text = (text or "").strip()[:512]
        if not cleaned_text:
            return {"category": categories[0], "score": 0.0, "all_scores": {categories[0]: 0.0}}

        try:
            if self.classifier is None:
                fallback_scores = {
                    category: float(cleaned_text.lower().count(category.lower()))
                    for category in categories
                }
                best_category = max(fallback_scores, key=fallback_scores.get, default=categories[0])
                return {
                    "category": best_category,
                    "score": fallback_scores.get(best_category, 0.0),
                    "all_scores": fallback_scores,
                }

            result = self.classifier(cleaned_text, categories)
            return {
                "category": result["labels"][0],
                "score": float(result["scores"][0]),
                "all_scores": {
                    label: float(score)
                    for label, score in zip(result["labels"], result["scores"], strict=False)
                },
            }
        except Exception as exc:
            logger.error("Error during categorization: {}", str(exc))
            return {
                "category": categories[0],
                "score": 0.0,
                "all_scores": {category: 0.0 for category in categories},
            }


@lru_cache(maxsize=1)
def get_ai_models() -> AIModels:
    return AIModels()
