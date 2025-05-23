# Foto Flow Server

This is the backend server for Foto Flow, providing a smooth experience for saving and managing your photos and videos in the cloud.

---

## Technologies Used

- **Node.js**
- **Express.js**
- **Prisma** (PostgreSQL)
- **TypeScript**
- **JWT** (Authentication)
- **Multer** (File uploads)
- **bcryptjs** (Password hashing)

---

## Project Structure

- `/src/Controller` – Route handlers (e.g., [`user.controller.ts`](src/Controller/user.controller.ts))
- `/src/Routes` – Express route definitions (e.g., [`user.route.ts`](src/Routes/user.route.ts))
- `/src/Middleware` – Custom middleware (e.g., [`auth.middleware.ts`](src/Middleware/auth.middleware.ts))
- `/prisma` – Prisma schema and migrations
- `/src/server.ts` – Main server entry point

---

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Configure environment variables:**  
   Create a `.env` file in `/SERVER` with:
   ```
   PORT=8080
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
3. **Run database migrations:**
   ```sh
   npx prisma migrate dev
   ```
4. **Start the server:**
   ```sh
   npm run dev
   ```
   The server will run on the port specified in `.env` (default: 8080).

---

## API Endpoints

### User

#### Register

- **POST** `/user/register`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-05-24T12:34:56.789Z"
    }
  }
  ```
- **Sets HTTP-only cookie:** `token`

---

#### Login

- **POST** `/user/login`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-05-24T12:34:56.789Z"
    }
  }
  ```
- **Sets HTTP-only cookie:** `token`

---

#### Profile

- **GET** `/user/profile`
- **Headers:**  
  Requires authentication (send cookie `token`).
- **Response:**
  ```json
  {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-05-24T12:34:56.789Z"
    }
  }
  ```

---

#### Logout

- **GET** `/user/logout`
- **Response:**
  ```json
  {
    "message": "Logout successful"
  }
  ```
- **Clears cookie:** `token`

---

## Error Responses

- **400 Bad Request:** Missing or invalid fields
  ```json
  { "message": "All fields are required" }
  ```
- **401 Unauthorized:** Invalid token or user not found
  ```json
  { "message": "Unauthorized" }
  ```
- **500 Internal Server Error:** Server-side error
  ```json
  { "message": "Internal Server Error" }
  ```

---

## Database Schema

See [`prisma/schema.prisma`](prisma/schema.prisma) for full details.  
Main models: `User`, `Album`, `Media`, `Person`, `RecognizedFace`.

---

## Development

- **Hot reload:** Uses `nodemon` and `ts-node` for development.
- **Type safety:** All endpoints and middleware are written in TypeScript.
- **Authentication:** JWT-based, stored in HTTP-only cookies.

---

## Example Usage (with fetch)

```js
// Register
fetch('http://localhost:8080/user/register', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane', email: 'jane@example.com', password: 'pass123' })
}).then(res => res.json()).then(console.log);

// Login
fetch('http://localhost:8080/user/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'jane@example.com', password: 'pass123' })
}).then(res => res.json()).then(console.log);

// Get Profile
fetch('http://localhost:8080/user/profile', {
  method: 'GET',
  credentials: 'include'
}).then(res => res.json()).then(console.log);

// Logout
fetch('http://localhost:8080/user/logout', {
  method: 'GET',
  credentials: 'include'
}).then(res => res.json()).then(console.log);
```

---

## License

ISC

---

## Author

paras yadav
