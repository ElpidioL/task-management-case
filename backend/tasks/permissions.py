from rest_framework.permissions import BasePermission

class IsOwnerOrShared(BasePermission):
    def has_object_permission(self, request, view, obj):

        if obj.owner == request.user:
            return True

        share = obj.shares.filter(user=request.user).first()

        if not share:
            return False

        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return share.can_edit