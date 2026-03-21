from __future__ import annotations

import json
import re
from dataclasses import dataclass

import httpx
from bs4 import BeautifulSoup
from loguru import logger


@dataclass
class ExtractedArticleContent:
    content: str | None
    description: str | None
    image_url: str | None


class ArticleContentExtractor:
    CONTENT_SELECTORS = (
        "article",
        "main article",
        "[itemprop='articleBody']",
        "div[itemprop='articleBody']",
        ".article-body__content",
        ".article-content__body",
        ".article-body",
        ".article-content",
        ".article__body",
        ".article__content",
        ".story-body",
        ".story-content",
        ".story__content",
        ".post-content",
        ".entry-content",
        ".content-body",
        ".article-text",
        ".article__text",
        ".story-text",
        ".news-article-body",
        ".body-copy",
        ".wysiwyg",
    )
    PREFERRED_EMBEDDED_KEYS = {
        "articlebody",
        "body",
        "content",
        "text",
        "story",
        "description",
        "summary",
    }

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(
            timeout=30,
            follow_redirects=True,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/123.0.0.0 Safari/537.36"
                ),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
            },
        )

    async def close(self) -> None:
        await self.client.aclose()

    @staticmethod
    def _clean_text(value: str | None) -> str | None:
        if not value:
            return None
        cleaned = re.sub(r"\s+", " ", value).strip()
        return cleaned or None

    @classmethod
    def _normalize_paragraphs(cls, paragraphs: list[str]) -> str | None:
        normalized: list[str] = []
        seen: set[str] = set()
        for paragraph in paragraphs:
            cleaned = cls._clean_text(paragraph)
            if not cleaned:
                continue
            if len(cleaned) < 20:
                continue
            dedupe_key = cleaned.lower()
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)
            normalized.append(cleaned)

        if not normalized:
            return None

        return "\n\n".join(normalized[:60])

    @staticmethod
    def _extract_meta(soup: BeautifulSoup, *names: str) -> str | None:
        for name in names:
            tag = soup.find("meta", attrs={"property": name}) or soup.find("meta", attrs={"name": name})
            if tag and tag.get("content"):
                return str(tag["content"]).strip()
        return None

    def _extract_from_json_ld(self, soup: BeautifulSoup) -> ExtractedArticleContent:
        description = None
        image_url = None
        paragraphs: list[str] = []

        for script in soup.find_all("script", attrs={"type": re.compile("ld\\+json", re.I)}):
            raw_json = script.string or script.get_text(strip=True)
            if not raw_json:
                continue
            try:
                payload = json.loads(raw_json)
            except Exception:
                continue

            queue = payload if isinstance(payload, list) else [payload]
            while queue:
                item = queue.pop(0)
                if isinstance(item, list):
                    queue.extend(item)
                    continue
                if not isinstance(item, dict):
                    continue

                item_type = item.get("@type")
                if isinstance(item_type, list):
                    item_types = [str(entry).lower() for entry in item_type]
                elif item_type:
                    item_types = [str(item_type).lower()]
                else:
                    item_types = []

                if any(article_type in item_types for article_type in ("newsarticle", "article", "reportagenewsarticle", "blogposting")):
                    article_body = item.get("articleBody")
                    if isinstance(article_body, str):
                        paragraphs.extend(article_body.splitlines())
                    if description is None:
                        description_value = item.get("description")
                        if isinstance(description_value, str):
                            description = description_value
                    if image_url is None:
                        image_value = item.get("image")
                        if isinstance(image_value, str):
                            image_url = image_value
                        elif isinstance(image_value, list) and image_value:
                            first_image = image_value[0]
                            if isinstance(first_image, str):
                                image_url = first_image
                            elif isinstance(first_image, dict):
                                image_url = first_image.get("url")
                        elif isinstance(image_value, dict):
                            image_url = image_value.get("url")

                graph = item.get("@graph")
                if graph:
                    queue.append(graph)

        return ExtractedArticleContent(
            content=self._normalize_paragraphs(paragraphs),
            description=self._clean_text(description),
            image_url=self._clean_text(image_url),
        )

    def _extract_from_dom(self, soup: BeautifulSoup) -> str | None:
        best_content: str | None = None
        for selector in self.CONTENT_SELECTORS:
            for container in soup.select(selector):
                for tag_name in ("script", "style", "noscript", "form", "nav", "footer", "aside"):
                    for tag in container.find_all(tag_name):
                        tag.decompose()
                paragraphs = [element.get_text(" ", strip=True) for element in container.select("p, h2, h3, li")]
                content = self._normalize_paragraphs(paragraphs)
                if content and len(content) >= 800:
                    return content
                if content and (best_content is None or len(content) > len(best_content)):
                    best_content = content

        body = soup.body
        if body is None:
            return best_content

        paragraphs = [element.get_text(" ", strip=True) for element in body.select("main p, article p, p")]
        fallback_content = self._normalize_paragraphs(paragraphs)
        if fallback_content and (best_content is None or len(fallback_content) > len(best_content)):
            return fallback_content
        return best_content

    def _extract_from_embedded_json(self, soup: BeautifulSoup) -> str | None:
        candidates: list[str] = []

        def walk(value: object, parent_key: str | None = None) -> None:
            if isinstance(value, dict):
                for key, item in value.items():
                    walk(item, str(key).lower())
                return
            if isinstance(value, list):
                for item in value:
                    walk(item, parent_key)
                return
            if not isinstance(value, str):
                return

            cleaned = self._clean_text(value)
            if not cleaned or len(cleaned) < 180:
                return

            key = (parent_key or "").lower()
            is_preferred_key = key in self.PREFERRED_EMBEDDED_KEYS or any(token in key for token in ("article", "story", "body", "content", "text"))
            looks_like_story = cleaned.count(". ") >= 3 or "\n" in value
            if is_preferred_key and looks_like_story:
                candidates.append(cleaned)

        for script in soup.find_all("script"):
            raw_text = script.string or script.get_text(strip=True)
            if not raw_text:
                continue
            script_type = (script.get("type") or "").lower()
            script_id = (script.get("id") or "").lower()
            if "ld+json" in script_type:
                continue
            if "json" not in script_type and "__next_data__" not in script_id:
                continue

            try:
                payload = json.loads(raw_text)
            except Exception:
                continue
            walk(payload)

        if not candidates:
            return None

        unique_candidates = sorted({candidate for candidate in candidates}, key=len, reverse=True)
        paragraphs = re.split(r"\n{2,}|(?<=[.!?])\s+(?=[A-Z0-9\"'])", unique_candidates[0])
        return self._normalize_paragraphs(paragraphs) or unique_candidates[0]

    async def extract(self, url: str) -> ExtractedArticleContent | None:
        try:
            response = await self.client.get(url)
            response.raise_for_status()
        except Exception as exc:
            logger.debug("Article content fetch failed for {}: {}", url, str(exc))
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        for tag_name in ("script", "style", "noscript"):
            for tag in soup.find_all(tag_name):
                tag.decompose()

        json_ld = self._extract_from_json_ld(soup)
        content = json_ld.content or self._extract_from_dom(soup) or self._extract_from_embedded_json(soup)
        description = json_ld.description or self._extract_meta(soup, "og:description", "description", "twitter:description")
        image_url = json_ld.image_url or self._extract_meta(soup, "og:image", "twitter:image")

        extracted = ExtractedArticleContent(
            content=self._clean_text(content),
            description=self._clean_text(description),
            image_url=self._clean_text(image_url),
        )
        return extracted if any((extracted.content, extracted.description, extracted.image_url)) else None
