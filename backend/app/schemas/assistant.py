from pydantic import BaseModel


class AssistantRequest(BaseModel):

    paper_id: str

    question: str