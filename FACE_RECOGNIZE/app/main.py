# app/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from app.tasks import recognize_faces

app = FastAPI()

class RecognizeRequest(BaseModel):
    media_id: str
    filename: str

@app.post("/recognize")
async def recognize(req: RecognizeRequest):
    recognize_faces.apply_async(args=[req.media_id, req.filename])
    return {"message": "Recognition task queued"}
