from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import router as auth_router

app = FastAPI(title="PaisaEra Auth API")

# Wide open for now — this is a phone/OTP endpoint meant to be called from
# the mobile app and the web preview during development, not a browser
# session with cookies to protect. Tighten this before this is the only
# thing standing between the internet and real user accounts.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
def health():
    return {"ok": True}
