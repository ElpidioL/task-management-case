import pytest
from django.contrib.auth import get_user_model
from accounts.serializers import CustomRegisterSerializer

User = get_user_model()


@pytest.fixture
def valid_data():
    return {
        "email": "elpidio@gmail.com",
        "password1": "StrongPassword123!",
        "password2": "StrongPassword123!"
    }


@pytest.mark.django_db
def test_valid_registration(valid_data):
    """Serializer should create a user with valid data"""
    serializer = CustomRegisterSerializer(data=valid_data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()
    assert user.email == valid_data["email"]
    assert user.check_password(valid_data["password1"])


@pytest.mark.django_db
def test_email_already_exists(valid_data):
    """Serializer should raise error if email already exists"""
    User.objects.create_user(email=valid_data["email"], password="SomePassword123!")
    serializer = CustomRegisterSerializer(data=valid_data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors
    assert serializer.errors["email"][0] == "Unable to register with provided credentials."


@pytest.mark.django_db
def test_passwords_do_not_match(valid_data):
    """Serializer should raise error if passwords do not match"""
    data = valid_data.copy()
    data["password2"] = "DifferentPassword123!"
    serializer = CustomRegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert "password" in serializer.errors
    assert serializer.errors["password"][0] == "Passwords do not match."


@pytest.mark.django_db
def test_weak_password(valid_data):
    """Serializer should raise error if password fails Django validators"""
    data = valid_data.copy()
    data["password1"] = data["password2"] = "123"
    serializer = CustomRegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert "password" in serializer.errors