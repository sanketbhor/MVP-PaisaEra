from ..config import settings
from .base import SmsDeliveryError, SmsProvider


class Msg91SmsProvider(SmsProvider):
    """Stub — real delivery via MSG91's OTP API isn't implemented yet,
    pending an MSG91 account + API key. In India specifically, this also
    needs DLT template registration with the telecom regulator before
    delivery will actually work, separate from the API integration itself.

    To finish this: register a DLT-approved OTP template with MSG91,
    then POST to https://api.msg91.com/api/v5/otp with MSG91_API_KEY,
    MSG91_SENDER_ID, the template id, and the phone number.
    """

    def send(self, phone_e164: str, code: str) -> None:
        if not settings.MSG91_API_KEY:
            raise SmsDeliveryError("MSG91_API_KEY not configured")
        raise SmsDeliveryError("MSG91 delivery not implemented yet — see docstring")
