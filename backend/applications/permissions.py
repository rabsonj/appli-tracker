from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    message = "You must be the owner of this application."

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsOwnerOrReviewer(BasePermission):
    message = "You must be the owner or a reviewer."

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user or request.user.is_reviewer


class CanEditApplication(BasePermission):
    message = "Applications can only be edited by their owner while in draft status."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user and obj.status == "draft"
