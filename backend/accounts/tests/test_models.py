import pytest
from django.db.utils import IntegrityError
from accounts.models import CustomUser


@pytest.mark.django_db
def test_create_user_with_email_and_password():
    """Creating a normal user with email and password works."""
    user = CustomUser.objects.create_user(
        email="elpidio@example.com",
        password="$strongpassword123"
    )
    assert user.email == "elpidio@example.com"
    assert user.check_password("$strongpassword123")
    assert not user.is_staff
    assert not user.is_superuser


@pytest.mark.django_db
def test_create_user_without_password_sets_unusable():
    """User created without password has unusable password."""
    user = CustomUser.objects.create_user(
        email="nopass@example.com"
    )
    assert user.email == "nopass@example.com"
    assert not user.has_usable_password()


@pytest.mark.django_db
def test_create_superuser():
    """Creating a superuser sets staff and superuser flags and requires a password."""
    user = CustomUser.objects.create_superuser(
        email="admin@example.com",
        password="adminpass"
    )
    assert user.is_staff
    assert user.is_superuser
    assert user.check_password("adminpass")


@pytest.mark.django_db
def test_create_superuser_without_password_raises():
    """Creating superuser without password raises ValueError."""
    with pytest.raises(ValueError):
        CustomUser.objects.create_superuser(
            email="failadmin@example.com"
        )


@pytest.mark.django_db
def test_email_normalization():
    """Emails should be normalized to lowercase."""
    user = CustomUser.objects.create_user(
        email="Test@Example.COM",
        password="pass"
    )
    assert user.email == "Test@example.com".lower()


@pytest.mark.django_db
def test_unique_email_constraint():
    """Cannot create two users with the same email."""
    CustomUser.objects.create_user(email="unique@example.com")
    with pytest.raises(IntegrityError):
        CustomUser.objects.create_user(email="unique@example.com")

@pytest.mark.django_db
def test_str_method():
    """__str__ returns the email."""
    user = CustomUser.objects.create_user(email="me@example.com")
    assert str(user) == "me@example.com"