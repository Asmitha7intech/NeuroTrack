from pydantic import BaseModel
from typing import Dict, Any


class FinalBehaviorRequest(BaseModel):
    typing_result: Dict[str, Any]
    attention_result: Dict[str, Any]
    reading_result: Dict[str, Any]
