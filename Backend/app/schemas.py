from pydantic import BaseModel


class OtpRequestBody(BaseModel):
    phone: str  # local 10-digit number, e.g. "9876543210" — same as the client's `phoneLocal`


class OtpVerifyBody(BaseModel):
    phone: str
    code: str


class RefreshBody(BaseModel):
    refresh_token: str
