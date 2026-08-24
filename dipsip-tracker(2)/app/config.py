import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'dipsip.db'}")

# If API_KEY is set, every request must carry a matching X-API-Key header.
API_KEY = os.getenv("API_KEY")
ENABLE_AUTH = bool(API_KEY)

SCHEDULER_HOUR = int(os.getenv("SCHEDULER_HOUR", "18"))
SCHEDULER_MINUTE = int(os.getenv("SCHEDULER_MINUTE", "30"))
TIMEZONE = os.getenv("TIMEZONE", "Asia/Kolkata")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# AMFI's official daily NAV dump — semicolon-delimited text, all schemes,
# refreshed once markets close. No auth, no key.
AMFI_NAV_URL = "https://www.amfiindia.com/spages/NAVAll.txt"

DEFAULT_THRESHOLDS = {
    "watch": -5.0,
    "buy1": -8.0,
    "buy2": -15.0,
    "buy3": -25.0,
}
