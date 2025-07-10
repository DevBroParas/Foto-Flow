# Dockerfile
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential cmake libglib2.0-0 libsm6 libxrender1 libxext6 libgtk2.0-dev

# Copy requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the entire project
COPY . .

# Default command (overridden per container)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
