from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .serializers import UserSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request: Request) -> Response:
    """Return the currently authenticated user and their role."""
    return Response(UserSerializer(request.user).data)
