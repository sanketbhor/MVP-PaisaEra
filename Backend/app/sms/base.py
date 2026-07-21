from abc import ABC, abstractmethod


class SmsDeliveryError(Exception):
    pass


class SmsProvider(ABC):
    @abstractmethod
    def send(self, phone_e164: str, code: str) -> None:
        """Raise SmsDeliveryError on failure. Must not raise for any other
        reason — callers treat a non-raising return as "delivered"."""
        raise NotImplementedError
