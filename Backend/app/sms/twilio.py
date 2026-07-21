from ..config import settings
from .base import SmsDeliveryError, SmsProvider


class TwilioSmsProvider(SmsProvider):
    """Stub — real delivery via Twilio isn't implemented yet, pending a
    Twilio account, phone number, and credentials.

    To finish this: `pip install twilio`, then use
    twilio.rest.Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN).messages.create(
        body=f"Your PaisaEra OTP is {code}", from_=TWILIO_FROM_NUMBER, to=phone_e164
    )
    """

    def send(self, phone_e164: str, code: str) -> None:
        if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER):
            raise SmsDeliveryError("Twilio credentials not fully configured")
        raise SmsDeliveryError("Twilio delivery not implemented yet — see docstring")
