from pydantic import BaseModel, Field
from typing import Literal


class AssistantRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1500)
    language: Literal['en', 'hi', 'gu'] = 'en'


class AssistantResponse(BaseModel):
    answer: str
    language: str
    source: Literal['gemini', 'fallback']
    disclaimer: str
