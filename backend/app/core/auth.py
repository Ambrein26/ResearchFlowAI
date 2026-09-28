import os
import uuid

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientError


load_dotenv()

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")

        if not algorithm:
            raise ValueError("Missing JWT algorithm.")

        supabase_url = os.getenv("SUPABASE_URL")
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

        if not supabase_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_URL is not configured.",
            )

        issuer = f"{supabase_url.rstrip('/')}/auth/v1"

        if algorithm == "HS256":
            if not jwt_secret:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="SUPABASE_JWT_SECRET is not configured.",
                )

            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                issuer=issuer,
                options={"require": ["sub"]},
            )

        elif algorithm in {"ES256", "RS256"}:
            jwks_url = f"{issuer}/.well-known/jwks.json"
            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[algorithm],
                audience="authenticated",
                issuer=issuer,
                options={"require": ["sub"]},
            )

        else:
            raise ValueError(f"Unsupported JWT algorithm: {algorithm}")

        user_id = payload.get("sub")

        if not isinstance(user_id, str) or not user_id:
            raise ValueError("Token subject is missing.")

        return str(uuid.UUID(user_id))

    except HTTPException:
        raise

    except (
        jwt.ExpiredSignatureError,
        jwt.InvalidTokenError,
        PyJWKClientError,
        OSError,
        ValueError,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )