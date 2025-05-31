import redis
import os
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis.from_url(os.getenv("REDIS_URL"))

def clear_all_faces():
    keys = r.keys("face:*")
    if keys:
        r.delete(*keys)
        print(f"Deleted {len(keys)} face encoding entries from Redis.")
    else:
        print("No face entries found to delete.")

if __name__ == "__main__":
    clear_all_faces()
