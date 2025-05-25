from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import face_recognition
import uvicorn
import uuid
import json
from pathlib import Path
from typing import List
from sklearn.cluster import DBSCAN
import numpy as np
from PIL import Image

MEDIA_DIR = Path(__file__).parent.parent / "SERVER" / "src" / "uploads"
MEDIA_DIR.mkdir(exist_ok=True)

app = FastAPI()

class RecognizeRequest(BaseModel):
    media_id: str
    filename: str

class FaceMatch(BaseModel):
    personId: str
    boundingBox: dict
    isPotentialMatch: bool

class RecognizeResponse(BaseModel):
    mediaId: str
    matches: List[FaceMatch]
    newPersons: List[str]

def resize_image(image_path: Path, max_size=800) -> np.ndarray:
    """Load image and resize to max_size keeping aspect ratio if larger."""
    with Image.open(image_path) as img:
        # Resize only if image is larger than max_size
        if max(img.width, img.height) > max_size:
            img.thumbnail((max_size, max_size))
        # Convert to RGB numpy array for face_recognition
        return np.array(img.convert('RGB'))

@app.post("/recognize", response_model=RecognizeResponse)
async def recognize(req: RecognizeRequest):
    file_path = MEDIA_DIR / req.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Load and resize image
    image = resize_image(file_path, max_size=800)

    # Detect faces using CNN model (accurate but slower)
    locations = face_recognition.face_locations(image, model="cnn")
    encodings = face_recognition.face_encodings(image, locations)

    store_path = Path(__file__).parent / "face_store.json"
    known = json.loads(store_path.read_text()) if store_path.exists() else []

    matches = []
    new_persons = []

    threshold = 0.45
    potential_threshold = 0.6

    if len(encodings) == 0:
        # No faces found
        return RecognizeResponse(mediaId=req.media_id, matches=[], newPersons=[])

    # Cluster encodings to merge multiple detections of the same person
    X = np.array(encodings)
    clustering = DBSCAN(eps=0.4, min_samples=1, metric='euclidean').fit(X)
    labels = clustering.labels_
    unique_labels = set(labels)

    matched_persons_in_this_photo = set()

    for label in unique_labels:
        indices = [i for i, l in enumerate(labels) if l == label]

        # Merge bounding boxes of this cluster by taking min top/left and max bottom/right
        top = min(locations[i][0] for i in indices)
        right = max(locations[i][1] for i in indices)
        bottom = max(locations[i][2] for i in indices)
        left = min(locations[i][3] for i in indices)

        # Average the encodings in cluster for better matching
        cluster_encodings = X[indices]
        avg_encoding = np.mean(cluster_encodings, axis=0)

        found = None
        min_dist = float("inf")

        for record in known:
            dist = face_recognition.face_distance([record["encoding"]], avg_encoding)[0]
            if dist < potential_threshold and dist < min_dist:
                found = record["personId"]
                min_dist = dist

        is_potential = False
        if found and min_dist >= threshold:
            is_potential = True  # Possible match, needs confirmation

        if not found or min_dist >= potential_threshold:
            # New person
            found = str(uuid.uuid4())
            known.append({"personId": found, "encoding": avg_encoding.tolist()})
            new_persons.append(found)
            is_potential = False

        # Skip duplicates in same photo
        if found in matched_persons_in_this_photo:
            continue
        matched_persons_in_this_photo.add(found)

        matches.append({
            "personId": found,
            "boundingBox": {
                "top": top,
                "right": right,
                "bottom": bottom,
                "left": left,
            },
            "isPotentialMatch": is_potential
        })

    store_path.write_text(json.dumps(known))

    return RecognizeResponse(mediaId=req.media_id, matches=matches, newPersons=new_persons)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
