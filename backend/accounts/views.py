from rest_framework import generics, permissions, status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

from .models import CustomUser
from .serializers import CustomRegisterSerializer

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = CustomUser.objects.all()
    serializer_class = CustomRegisterSerializer

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            response = Response(response.data, status=status.HTTP_200_OK)
            response.set_cookie(
                key="access",
                value=response.data["access"],
                httponly=True,
                secure=True,
                samesite="Lax"
            )
            response.set_cookie(
                key="refresh",
                value=response.data["refresh"],
                httponly=True,
                secure=settings.PRODUCTION,
                samesite="Lax"
            )
            response.data = {"detail": "Login successful"}
        return response
    
class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "No refresh token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {"detail": "Invalid refresh token"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        access_token = serializer.validated_data["access"]

        response = Response(
            {"detail": "Token refreshed successfully"},
            status=status.HTTP_200_OK
        )

        response.set_cookie(
            key="access",
            value=access_token,
            httponly=True,
            secure=settings.PRODUCTION,
            samesite="Lax"
        )

        return response

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": str(user.id),
            "email": user.email,
            "is_staff": user.is_staff,
        })