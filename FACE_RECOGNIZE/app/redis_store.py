# app/redis_store.py
import redis
import json
import numpy as np
import os
from dotenv import load_dotenv
load_dotenv()

r = redis.Redis.from_url(os.getenv("REDIS_URL"))

def get_known_faces():
    keys = r.keys("face:*")
    known = []
    for k in keys:
        data = r.get(k)
        if data:
            record = json.loads(data)
            known.append({
                "personId": k.decode().split(":")[1],
                "encoding": np.array(record["encoding"])
            })
    return known

def save_new_face(person_id: str, encoding: np.ndarray):
    key = f"face:{person_id}"
    r.set(key, json.dumps({"encoding": encoding.tolist()}))
