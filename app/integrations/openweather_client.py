from app.integrations.base_client import BaseAPIClient


class OpenWeatherClient(BaseAPIClient):
    def __init__(self) -> None:
        super().__init__(base_url="https://api.openweathermap.org")
