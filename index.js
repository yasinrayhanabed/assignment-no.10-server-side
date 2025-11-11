const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://Online-Learning:883fT8J671i9iPhP@cluster0.xdad6f7.mongodb.net/?appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('online-learning-platform');
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Online Learning Platform API Server' });
});

// Get all courses with search, category filter, and sorting
app.get('/courses', async (req, res) => {
  try {
    const { search, category, sortBy } = req.query;
    let query = {};
    let sort = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (sortBy === 'price') {
      sort.price = 1;
    } else if (sortBy === 'duration') {
      sort.duration = 1;
    }
    
    const courses = await db.collection('courses').find(query).sort(sort).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course
app.get('/courses/:id', async (req, res) => {
  try {
    const course = await db.collection('courses').findOne({ _id: new ObjectId(req.params.id) });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new course
app.post('/courses', async (req, res) => {
  try {
    const course = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('courses').insertOne(course);
    res.json({ insertedId: result.insertedId, message: 'Course added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
app.put('/courses/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    const result = await db.collection('courses').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
app.delete('/courses/:id', async (req, res) => {
  try {
    const result = await db.collection('courses').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured courses for home page
app.get('/courses/featured', async (req, res) => {
  try {
    const courses = await db.collection('courses').find({ isFeatured: true }).limit(6).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses by instructor email
app.get('/instructor/:email', async (req, res) => {
  try {
    const courses = await db.collection('courses').find({ instructorEmail: req.params.email }).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top instructors for home page
app.get('/instructors/top', async (req, res) => {
  try {
    const instructors = await db.collection('instructors').find({}).limit(4).toArray();
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll in course
app.post('/enroll', async (req, res) => {
  try {
    const { userEmail, courseId, courseName, instructorName, duration } = req.body;
    
    // Check if already enrolled
    const existing = await db.collection('enrollments').findOne({ 
      userEmail, 
      courseId: new ObjectId(courseId) 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    const enrollment = {
      userEmail,
      courseId: new ObjectId(courseId),
      courseName,
      instructorName,
      duration,
      enrolledAt: new Date(),
      progress: 0
    };
    
    const result = await db.collection('enrollments').insertOne(enrollment);
    res.json({ message: 'Enrolled successfully', enrollmentId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get enrolled courses for user
app.get('/enroll/:email', async (req, res) => {
  try {
    const enrollments = await db.collection('enrollments').find({ userEmail: req.params.email }).toArray();
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add user
app.post('/users', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = {
      ...req.body,
      createdAt: new Date()
    };
    const result = await db.collection('users').insertOne(user);
    res.json({ insertedId: result.insertedId, message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by email
app.get('/users/:email', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update enrollment progress
app.put('/enroll/:id/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    const result = await db.collection('enrollments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { progress: progress, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin)
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await db.collection('courses').distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate certificate
app.post('/certificate', async (req, res) => {
  try {
    const { userEmail, courseId } = req.body;
    const enrollment = await db.collection('enrollments').findOne({
      userEmail,
      courseId: new ObjectId(courseId),
      progress: 100
    });
    
    if (!enrollment) {
      return res.status(400).json({ error: 'Course not completed' });
    }
    
    res.json({ message: 'Certificate generated', certificateUrl: '#' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review
app.post('/reviews', async (req, res) => {
  try {
    const review = {
      ...req.body,
      courseId: new ObjectId(req.body.courseId),
      createdAt: new Date()
    };
    const result = await db.collection('reviews').insertOne(review);
    res.json({ insertedId: result.insertedId, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for course
app.get('/reviews/:courseId', async (req, res) => {
  try {
    const reviews = await db.collection('reviews').find({ courseId: new ObjectId(req.params.courseId) }).toArray();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});