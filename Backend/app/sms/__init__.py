from ..config import settings
from .base import SmsDeliveryError, SmsProvider
from .console import ConsoleSmsProvider
from .msg91 import Msg91SmsProvider
from .twilio import TwilioSmsProvider

_PROVIDERS: dict[str, type[SmsProvider]] = {
    "console": ConsoleSmsProvider,
    "msg91": Msg91SmsProvider,
    "twilio": TwilioSmsProvider,
}


def get_sms_provider() -> SmsProvider:
    provider_cls = _PROVIDERS.get(settings.SMS_PROVIDER)
    if provider_cls is None:
        raise RuntimeError(
            f"Unknown SMS_PROVIDER '{settings.SMS_PROVIDER}' — expected one of {list(_PROVIDERS)}"
        )
    return provider_cls()


__all__ = ["get_sms_provider", "SmsDeliveryError", "SmsProvider"]
