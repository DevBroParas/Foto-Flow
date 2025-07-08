# app/tasks.py
import os
import uuid
import logging
import requests
import numpy as np
import face_recognition
from pathlib import Path
from sklearn.cluster import DBSCAN
from PIL import Image
from dotenv import load_dotenv
from celery import Celery
from app.redis_store import get_known_faces, save_new_face

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Setup paths and Redis URL from environment variables (set defaults if needed)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
UPLOAD_FOLDER = Path(os.getenv("UPLOAD_FOLDER", "./uploads")).resolve()
UPLOAD_FOLDER.mkdir(exist_ok=True, parents=True)

# Create Celery app instance
celery = Celery("tasks", broker=REDIS_URL)

def resize_image(image_path: Path, max_size=800) -> np.ndarray:
    """Resize the image if either dimension is larger than max_size."""
    with Image.open(image_path) as img:
        if max(img.width, img.height) > max_size:
            img.thumbnail((max_size, max_size))
        return np.array(img.convert("RGB"))

@celery.task(bind=True)
def recognize_faces(self, media_id: str, filename: str):
    try:
        file_path = UPLOAD_FOLDER / filename
        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            return

        image = resize_image(file_path)
        logger.info(f"Image resized and loaded for {filename}")
        # you can use cnn for accuracy and hog for speed on low end device
        locations = face_recognition.face_locations(image, model="hog")
        if not locations:
            logger.info(f"No faces found in {filename}. Sending empty response.")
            requests.post(BACKEND_URL + "/recognize/internal", json={
                "mediaId": media_id,
                "matches": [],
                "newPersons": []
            })
            return

        encodings = face_recognition.face_encodings(image, locations)
        if not encodings:
            logger.info(f"No face encodings found in {filename}. Sending empty response.")
            requests.post(BACKEND_URL + "/recognize/internal", json={
                "mediaId": media_id,
                "matches": [],
                "newPersons": []
            })
            return

        X = np.array(encodings)
        clustering = DBSCAN(eps=0.4, min_samples=1, metric='euclidean').fit(X)
        labels = clustering.labels_
        unique_labels = set(labels)

        known = get_known_faces()
        matches = []
        new_persons = []

        threshold = 0.45
        potential_threshold = 0.6

        for label in unique_labels:
            indices = [i for i, l in enumerate(labels) if l == label]
            cluster_encodings = X[indices]
            avg_encoding = np.mean(cluster_encodings, axis=0)

            top = min(locations[i][0] for i in indices)
            right = max(locations[i][1] for i in indices)
            bottom = max(locations[i][2] for i in indices)
            left = min(locations[i][3] for i in indices)

            found = None
            min_dist = float("inf")

            for rec in known:
                dist = face_recognition.face_distance([rec["encoding"]], avg_encoding)[0]
                if dist < potential_threshold and dist < min_dist:
                    found = rec["personId"]
                    min_dist = dist

            is_potential = False
            if found and min_dist >= threshold:
                is_potential = True

            if not found or min_dist >= potential_threshold:
                found = str(uuid.uuid4())
                save_new_face(found, avg_encoding)
                new_persons.append(found)
                is_potential = False

            matches.append({
                "personId": found,
                "boundingBox": {"top": top, "right": right, "bottom": bottom, "left": left},
                "isPotentialMatch": is_potential
            })

        resp = requests.post(BACKEND_URL + "/recognize/internal", json={
            "mediaId": media_id,
            "matches": matches,
            "newPersons": new_persons
        },
        timeout=10 # Set timeout to 10 seconds
        )

        logger.info(f"Recognition results sent for mediaId {media_id} with status code {resp.status_code}")
        return True

    except Exception as e:
        logger.error(f"Error processing recognize_faces task for mediaId {media_id} and file {filename}: {e}", exc_info=True)
        raise self.retry(exc=e, countdown=10, max_retries=3)
