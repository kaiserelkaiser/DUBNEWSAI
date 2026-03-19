from fastapi import status


class AppException(Exception):
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = "app_error",
    ) -> None:
        self.detail = detail
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(detail)


class ResourceNotFoundError(AppException):
    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND, error_code="not_found")


class AuthenticationError(AppException):
    def __init__(self, detail: str = "Authentication failed") -> None:
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED, error_code="auth_failed")


class ConflictError(AppException):
    def __init__(self, detail: str = "Resource already exists") -> None:
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT, error_code="conflict")


class InactiveUserError(AppException):
    def __init__(self, detail: str = "Inactive user") -> None:
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST, error_code="inactive_user")


class APIClientError(AppException):
    def __init__(self, detail: str = "External API request failed") -> None:
        super().__init__(detail=detail, status_code=status.HTTP_502_BAD_GATEWAY, error_code="api_client_error")
