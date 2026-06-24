from django.contrib import admin
from django.contrib.auth import admin as dj_auth_admin

from users import models as user_models


@admin.register(user_models.User)
class CustomUserAdmin(dj_auth_admin.UserAdmin):
    list_display = ("username", "email", "role", "is_staff")
    list_filter = ("role", "is_staff")
    fieldsets = dj_auth_admin.UserAdmin.fieldsets + (("Role", {"fields": ("role",)}),)
    add_fieldsets = dj_auth_admin.UserAdmin.add_fieldsets + (
        ("Role", {"fields": ("role",)}),
    )
