# LearnVerse API Endpoints

## Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://your-vercel-app.vercel.app`

## API Endpoints

### Courses
```javascript
// Get all courses (with filters)
GET http://localhost:3000/courses
GET http://localhost:3000/courses?search=react
GET http://localhost:3000/courses?category=programming
GET http://localhost:3000/courses?sortBy=price

// Get featured courses (homepage)
GET http://localhost:3000/courses/featured

// Get single course
GET http://localhost:3000/courses/:id

// Add new course
POST http://localhost:3000/courses

// Update course
PUT http://localhost:3000/courses/:id

// Delete course
DELETE http://localhost:3000/courses/:id
```

### Users & Authentication
```javascript
// Register user
POST http://localhost:3000/users

// Get user profile
GET http://localhost:3000/users/:email

// Get all users (admin)
GET http://localhost:3000/users
```

### Enrollment
```javascript
// Enroll in course
POST http://localhost:3000/enroll

// Get user's enrolled courses
GET http://localhost:3000/enroll/:email

// Update progress
PUT http://localhost:3000/enroll/:id/progress
```

### Instructor
```javascript
// Get instructor's courses
GET http://localhost:3000/instructor/:email
```

### Others
```javascript
// Get course categories
GET http://localhost:3000/categories

// Get top instructors
GET http://localhost:3000/instructors/top

// Generate certificate
POST http://localhost:3000/certificate

// Add review
POST http://localhost:3000/reviews

// Get course reviews
GET http://localhost:3000/reviews/:courseId
```

## Frontend Integration Example

```javascript
const API_BASE = 'http://localhost:3000';

// Fetch all courses
const fetchCourses = async () => {
  const response = await fetch(`${API_BASE}/courses`);
  const courses = await response.json();
  return courses;
};

// Fetch featured courses
const fetchFeaturedCourses = async () => {
  const response = await fetch(`${API_BASE}/courses/featured`);
  const courses = await response.json();
  return courses;
};

// Enroll in course
const enrollCourse = async (enrollmentData) => {
  const response = await fetch(`${API_BASE}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enrollmentData)
  });
  const result = await response.json();
  return result;
};
```