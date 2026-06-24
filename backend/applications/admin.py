from django.contrib import admin

from applications import models as application_models


@admin.register(application_models.Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "status", "created_at")
    list_filter = ("status", "category")
    search_fields = ("title", "owner__username")
    readonly_fields = ("status", "created_at", "updated_at")


@admin.register(application_models.AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("application", "actor", "from_status", "to_status", "created_at")
    readonly_fields = (
        "application",
        "actor",
        "from_status",
        "to_status",
        "comment",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
