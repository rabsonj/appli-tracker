from django.urls import include, path
from rest_framework.routers import DefaultRouter

from applications import views as application_views

router = DefaultRouter()
router.register(
    r"applications", application_views.ApplicationViewSet, basename="application"
)

urlpatterns = [
    path("", include(router.urls)),
]
