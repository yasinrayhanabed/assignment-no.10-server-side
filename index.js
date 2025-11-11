const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const uri ="mongodb+srv://Online-Learning:883fT8J671i9iPhP@cluster0.xdad6f7.mongodb.net/?appName=Cluster0";

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let isConnected = false;

async function connectDB() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    db = client.db('online-learning-platform');
    isConnected = true;
    console.log('✅ Connected to MongoDB!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Online Learning Platform API Server' });
});

app.get('/courses', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
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
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/courses/:id', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const course = await db.collection('courses').findOne({ _id: new ObjectId(req.params.id) });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/enroll', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
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

app.get('/enroll/:userEmail', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const enrollments = await db.collection('enrollments').find({
      userEmail: req.params.userEmail
    }).toArray();
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/enroll/:enrollmentId/progress', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { progress } = req.body;
    await db.collection('enrollments').updateOne(
      { _id: new ObjectId(req.params.enrollmentId) },
      { $set: { progress: parseInt(progress) } }
    );
    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories endpoint
app.get('/categories', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const categories = await db.collection('courses').distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Featured courses endpoint
app.get('/courses/featured', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const courses = await db.collection('courses').find({ featured: true }).limit(6).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User by email endpoint
app.get('/users/:email', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const user = await db.collection('users').findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    database: isConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`💾 Database: ${isConnected ? 'Connected' : 'Disconnected'}`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});