from django.db.models import Q
from django.utils.timezone import now
from rest_framework import viewsets, filters, permissions, status
from rest_framework.response import Response
from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer
from .permissions import IsOwnerOrShared


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrShared]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "due_date"]

    def get_queryset(self):
        user = self.request.user

        qs = Task.objects.filter(
            Q(owner=user) | Q(shares__user=user)
        ).distinct()

        status_filter = self.request.query_params.get("status", "").strip().lower()
        if status_filter == "completed":
            qs = qs.filter(is_completed=True)
        elif status_filter == "pending":
            qs = qs.filter(is_completed=False)

        scope_filter = self.request.query_params.get("scope", "").strip().lower()
        if scope_filter == "mine":
            qs = qs.filter(owner=user)
        elif scope_filter == "shared":
            qs = qs.filter(shares__user=user).exclude(owner=user)

        category_id = self.request.query_params.get("category", "").strip()
        if category_id and category_id.lower() != "all":
            qs = qs.filter(category_id=category_id)

        due_filter = self.request.query_params.get("due", "").strip().lower()
        if due_filter == "no_due":
            qs = qs.filter(due_date__isnull=True)
        elif due_filter == "has_due":
            qs = qs.filter(due_date__isnull=False)
        elif due_filter == "due_today":
            qs = qs.filter(due_date__date=now().date())
        elif due_filter == "overdue":
            qs = qs.filter(due_date__lt=now(), is_completed=False)

        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        task = serializer.save(updated_by=self.request.user)

        if task.is_completed and not task.completed_by:
            task.completed_by = self.request.user
            from django.utils.timezone import now

            task.completed_at = now()
            task.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)