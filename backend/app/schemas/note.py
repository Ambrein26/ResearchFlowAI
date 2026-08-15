from pydantic import BaseModel


class NoteCreate(BaseModel):
    content: str


class NoteUpdate(BaseModel):
    content: str