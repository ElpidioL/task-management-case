from django.urls import path, include
from . import views

urlpatterns = [
    path("auth/registration/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", views.CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", views.CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("user/", views.CurrentUserView.as_view(), name="current_user"),
]