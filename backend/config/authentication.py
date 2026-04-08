from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access')

        if not access_token:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
        except (InvalidToken, TokenError):
            return None

        user = self.get_user(validated_token)
        return (user, validated_token)