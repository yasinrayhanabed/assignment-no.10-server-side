const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://Online-Learning:883fT8J671i9iPhP@cluster0.xdad6f7.mongodb.net/?appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../Online-Learning-Platform-Client/dist')));

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

// API Routes (same as your existing routes)
app.get('/api', (req, res) => {
  res.json({ message: 'Online Learning Platform API Server' });
});

// All API routes with /api prefix
app.get('/api/courses', async (req, res) => {
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

app.get('/api/courses/:id', async (req, res) => {
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

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.collection('courses').distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/courses/featured', async (req, res) => {
  try {
    const courses = await db.collection('courses').find({ featured: true }).limit(6).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/enroll', async (req, res) => {
  try {
    const { courseId, userEmail, courseName, instructorName, duration } = req.body;
    
    const existingEnrollment = await db.collection('enrollments').findOne({
      courseId,
      userEmail
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    const enrollment = {
      courseId,
      userEmail,
      courseName,
      instructorName,
      duration: parseInt(duration),
      progress: 0,
      enrolledAt: new Date()
    };
    
    const result = await db.collection('enrollments').insertOne(enrollment);
    res.json({ message: 'Enrolled successfully', enrollmentId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/enroll/:userEmail', async (req, res) => {
  try {
    const enrollments = await db.collection('enrollments').find({
      userEmail: req.params.userEmail
    }).toArray();
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    database: db ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Online-Learning-Platform-Client/dist/index.html'));
});

// Start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Production server running on port ${port}`);
    console.log(`Frontend: http://localhost:${port}`);
    console.log(`API: http://localhost:${port}/api`);
  });
});