from .base import SmsProvider


class ConsoleSmsProvider(SmsProvider):
    """Local-dev delivery: prints the OTP to this process's own stdout
    instead of sending a real SMS. Read it from the terminal running
    uvicorn. Never used unless SMS_PROVIDER=console (the default)."""

    def send(self, phone_e164: str, code: str) -> None:
        print(f"[console-sms] OTP for {phone_e164}: {code}")
