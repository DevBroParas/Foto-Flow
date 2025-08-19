# Foto-Flow

**Foto-Flow** is a media storage application that allows users to save and manage photos and videos. It also includes a face recognition feature for organizing or processing media based on detected faces.

---

##  Project Structure

The repository is organized into three key components:

- **client/**  
  Front-end application (React + TypeScript).

- **server/**  
  Back-end API and server logic (Express + Prisma + PostgreSQL + Redis).

- **face_recognise/**  
  Face recognition microservice (Python + OpenCV/face-recognition libraries).

- **docker-compose.yml**  
  Docker configuration for running the entire stack with a single command.

Each of these folders includes its own `README.md` with more detailed instructions and context.

---

##  Features

- **Media Upload & Storage** – Upload and save photos and videos securely.
- **Media Management** – Browse, view, and manage uploaded media.
- **Face Recognition** – Detect and identify faces in uploaded media.
- **Dockerized Setup** – Run the entire project (frontend, backend, DB, Redis, and face recognition service) with one command.

---

##  Prerequisites

Before getting started, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/)

---

##  Getting Started

Follow these steps to set up **Foto-Flow** locally:

### 1. Clone the Repository

```bash
git clone https://github.com/DevBroParas/Foto-Flow.git
cd Foto-Flow
```

### 2. Configure Environment Variables

Copy the example environment files and adjust values for your setup:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Make sure to configure:

- Database connection (PostgreSQL)
- Redis connection
- Face recognition model paths
- API keys or secrets (if required)

---

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

This will start:

- **client** → Front-end on `http://localhost:3000`
- **server** → Back-end API on `http://localhost:5000` (or configured port)
- **face_recognise** → Face recognition service
- **postgres** → Database
- **redis** → Caching/queue service

---

##  Usage

1. Open the UI at [http://localhost:3000](http://localhost:3000).
2. Upload photos and videos.
3. Use face recognition tools to analyze and tag media.
4. Search and browse based on tags or recognized people.

---

##  Folder-Specific Documentation

- **client/README.md** – Front-end details.
- **server/README.md** – Back-end API and database schema.
- **face_recognise/README.md** – Face recognition microservice setup.

---

##  Contributing

Contributions are welcome! Please:

1. Fork this repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add feature..."`).
4. Push (`git push origin feature/your-feature`).
5. Open a pull request for review.

---

##  License

*Specify project license (e.g., MIT, GPL, Apache 2.0)*

---

##  Contact

For questions or feedback, reach out via:

- **GitHub Issues**
- **Email:** parasprofessionaly@gmail.com
