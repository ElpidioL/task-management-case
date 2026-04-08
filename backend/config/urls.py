from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.decorators import user_passes_test
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings

urlpatterns = [
    path("api/", include("accounts.urls")),
]

if not settings.PRODUCTION:
    urlpatterns += [
        path('admin/', admin.site.urls),
        path(
            "api/schema/",
            user_passes_test(lambda u: u.is_authenticated and u.is_staff)(
                SpectacularAPIView.as_view()
            ),
            name="schema"
        ),
        path(
            "api/docs/",
            user_passes_test(lambda u: u.is_authenticated and u.is_staff)(
                SpectacularSwaggerView.as_view(url_name="schema")
            ),
            name="swagger-ui"
        ),
    ]
