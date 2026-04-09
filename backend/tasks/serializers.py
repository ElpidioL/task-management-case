from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Category, Task, TaskShare

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color", "created_at"]
        read_only_fields = ["id", "created_at"]

class TaskShareSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source="user.email")
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = TaskShare
        fields = ["id", "user", "user_email", "can_edit", "email"]
        read_only_fields = ["id", "user", "user_email"]

    def validate(self, attrs):
        email = attrs.pop("email", None)
        if email and str(email).strip():
            try:
                attrs["user"] = User.objects.get(email__iexact=email.strip())
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"email": "No user with this email address."}
                )
        if not attrs.get("user"):
            raise serializers.ValidationError({"email": "This field is required."})
        return attrs

    def create(self, validated_data):
        task = self.context.get("task")
        if not task:
            raise serializers.ValidationError({"task": "Task context is required."})
        return TaskShare.objects.create(task=task, **validated_data)

class TaskSerializer(serializers.ModelSerializer):
    shares = TaskShareSerializer(many=True, required=False)
    category_name = serializers.ReadOnlyField(source="category.name")
    category_color = serializers.ReadOnlyField(source="category.color")
    owner_email = serializers.ReadOnlyField(source="owner.email")

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "owner",
            "owner_email",
            "category",
            "category_name",
            "category_color",
            "is_completed",
            "due_date",
            "completed_by",
            "completed_at",
            "shares",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "owner_email",
            "completed_by",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        shares_data = validated_data.pop("shares", [])
        task = Task.objects.create(**validated_data)

        for share in shares_data:
            TaskShare.objects.create(task=task, **share)

        return task

    def update(self, instance, validated_data):
        shares_data = validated_data.pop("shares", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if shares_data is not None:
            instance.shares.all().delete()
            for share in shares_data:
                TaskShare.objects.create(task=instance, **share)

        return instance