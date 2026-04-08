from django.contrib import admin
from .models import Category, Task, TaskShare

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "color", "created_at"]
    list_filter = ["user", "created_at"]
    search_fields = ["name", "user__email"]

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "owner",
        "is_completed",
        "is_deleted",
        "category",
        "due_date",
        "created_at",
    ]

    list_filter = [
        "is_completed",
        "is_deleted",
        "category",
        "created_at",
    ]

    search_fields = [
        "title",
        "description",
        "owner__email",
    ]

    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
        "completed_at",
    ]

@admin.register(TaskShare)
class TaskShareAdmin(admin.ModelAdmin):
    list_display = ["task", "user", "can_edit", "created_at"]
    list_filter = ["can_edit", "created_at"]
    search_fields = ["task__title", "user__email"]

    autocomplete_fields = ["task", "user"]

    readonly_fields = ["id", "created_at"]