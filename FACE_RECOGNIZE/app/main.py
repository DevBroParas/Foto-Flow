from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from app.tasks import recognize_faces

app = FastAPI()

class RecognizeItem(BaseModel):
    media_id: str
    filename: str

class RecognizeBatchRequest(BaseModel):
    items: List[RecognizeItem]

@app.post("/recognize")
async def recognize_batch(req: RecognizeBatchRequest):
    for item in req.items:
        recognize_faces.apply_async(args=[item.media_id, item.filename])
    return {"message": f"{len(req.items)} recognition tasks queued"}
