from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
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
