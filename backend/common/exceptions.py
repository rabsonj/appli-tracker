from typing import Any
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(
    exc: Exception, context: dict[str, Any]
) -> Response | None:
    """Formats API exceptions into a standard JSON structure.

    This handler takes the standard DRF exception response and reformats it
    into a consistent JSON object with 'error', 'detail', and 'status_code' keys.

    Args:
        exc: The exception instance.
        context: A dictionary containing the view and request.

    Returns:
        A DRF Response object with the formatted error, or None if the
        exception could not be handled.
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_map = {
            400: "bad_request",
            401: "unauthorized",
            403: "forbidden",
            404: "not_found",
            405: "method_not_allowed",
        }

        code = error_map.get(response.status_code, "error")
        detail = response.data
        if isinstance(detail, dict) and "detail" in detail:
            detail = str(detail["detail"])

        response.data = {
            "error": code,
            "detail": detail,
            "status_code": response.status_code,
        }

    return response
