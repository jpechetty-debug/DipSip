from fastapi import Header, HTTPException

from .config import API_KEY, ENABLE_AUTH


def require_api_key(x_api_key: str = Header(default=None)) -> bool:
    """No-op if API_KEY isn't set in the environment (default for local/solo
    use). Once you deploy somewhere internet-reachable, set API_KEY and every
    request will need a matching X-API-Key header."""
    if not ENABLE_AUTH:
        return True
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return True
