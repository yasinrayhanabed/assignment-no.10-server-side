# Online Learning Platform Server

A Node.js Express server for managing online courses and student enrollments.

## Features

- Course management (CRUD operations)
- User registration and management
- Course enrollment system
- Instructor course management
- MongoDB integration

## API Endpoints

### Courses
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get single course
- `POST /courses` - Add new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /instructor/:email` - Get courses by instructor

### Users
- `POST /users` - Add new user
- `GET /users/:email` - Get user by email

### Enrollments
- `POST /enroll` - Enroll in course
- `GET /enroll/:email` - Get user enrollments

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with MongoDB connection string

3. Start server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)