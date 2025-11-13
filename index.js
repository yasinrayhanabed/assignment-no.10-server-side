const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const admin = require("firebase-admin");

// index.js
const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


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

// Check enrollment status
app.get('/check-enrollment/:courseId/:userEmail', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const enrollment = await db.collection('enrollments').findOne({
      courseId: req.params.courseId,
      userEmail: req.params.userEmail
    });
    res.json({ enrolled: !!enrollment });
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

// Featured courses endpoint - MUST come before /courses/:id
app.get('/courses/featured', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const courses = await db.collection('courses').find({ isFeatured: true }).limit(6).toArray();
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

// Add new user
app.post('/users', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const { name, email, photoURL, role = 'student' } = req.body;
    
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.json(existingUser);
    }
    
    const user = {
      name,
      email,
      photoURL,
      role,
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(user);
    res.json({ ...user, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new course
app.post('/add-course', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { title, image, price, duration, category, description, isFeatured, instructor } = req.body;
    
    const course = {
      title,
      image,
      price: parseFloat(price),
      duration: parseInt(duration),
      category,
      description,
      isFeatured: Boolean(isFeatured),
      instructor,
      createdAt: new Date(),
      enrolledCount: 0
    };
    
    const result = await db.collection('courses').insertOne(course);
    res.json({ message: 'Course added successfully', courseId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
app.put('/update-course/:id', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const { title, image, price, duration, category, description, isFeatured } = req.body;
    
    const updateData = {
      title,
      image,
      price: parseFloat(price),
      duration: parseInt(duration),
      category,
      description,
      isFeatured: Boolean(isFeatured),
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
app.delete('/delete-course/:id', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const result = await db.collection('courses').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses by instructor email
app.get('/courses/instructor/:email', async (req, res) => {
  try {
    if (!db || !isConnected) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    
    const courses = await db.collection('courses').find({
      'instructor.email': req.params.email
    }).toArray();
    
    res.json(courses);
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

// Seed sample data
async function seedData() {
  try {
    const coursesCount = await db.collection('courses').countDocuments();
    if (coursesCount === 0) {
      const sampleCourses = [
        {
          title: "Complete React Development Course",
          image: "https://i.ibb.co.com/SXzrFH67/react-js-inscription-against-laptop-and-code-background-learn-react-programming-language-computer-co.jpg",
          price: 99,
          duration: 12,
          category: "Web Development",
          description: "Master React from basics to advanced concepts including hooks, context, and modern patterns.",
          isFeatured: true,
          instructor: { name: "John Doe", email: "john@example.com" },
          createdAt: new Date(),
          enrolledCount: 245
        },
        {
          title: "Python for Data Science",
          image: "https://i.ibb.co.com/v6qd0KQJ/pythom-data-science.webp",
          price: 129,
          duration: 16,
          category: "Data Science",
          description: "Learn Python programming for data analysis, visualization, and machine learning.",
          isFeatured: true,
          instructor: { name: "Jane Smith", email: "jane@example.com" },
          createdAt: new Date(),
          enrolledCount: 189
        },
        {
          title: "UI/UX Design Fundamentals",
          image: "https://i.ibb.co.com/vvjB7KDW/images-q-tbn-ANd9-Gc-Rhf-OQKOixn45-CBe-Tn-Xq-PDJCDFd-ADC1-Tx-Flfg-s.jpg",
          price: 79,
          duration: 8,
          category: "Design",
          description: "Create beautiful and user-friendly interfaces with modern design principles.",
          isFeatured: true,
          instructor: { name: "Mike Johnson", email: "mike@example.com" },
          createdAt: new Date(),
          enrolledCount: 156
        },
        {
          title: "Node.js Backend Development",
          image: "https://i.ibb.co.com/mFrf0J6k/creative-abstract-quantum-illustration-23-2149236239.jpg",
          price: 109,
          duration: 14,
          category: "Backend Development",
          description: "Build scalable backend applications with Node.js, Express, and MongoDB.",
          isFeatured: true,
          instructor: { name: "Sarah Wilson", email: "sarah@example.com" },
          createdAt: new Date(),
          enrolledCount: 203
        },
        {
          title: "Mobile App Development with React Native",
          image: "https://i.ibb.co.com/1Y9T3rpx/images-q-tbn-ANd9-Gc-QFiqh-NPIf-C41v-Arw-UJ6mf-Nw5-EJ-o-TEbvc-O4w-s.jpg",
          price: 149,
          duration: 18,
          category: "Mobile Development",
          description: "Create cross-platform mobile apps using React Native and modern development tools.",
          isFeatured: true,
          instructor: { name: "Alex Chen", email: "alex@example.com" },
          createdAt: new Date(),
          enrolledCount: 134
        },
        {
          title: "Digital Marketing Mastery",
          image: "https://i.ibb.co.com/GB8J3G2/1700542164188-e-2147483647-v-beta-t-VQlw-NSONr-Jj-Y1-QGQFPF80-HZOUV5k-YJc18q-Di8-FIt0i4.png",
          price: 89,
          duration: 10,
          category: "Marketing",
          description: "Master digital marketing strategies including SEO, social media, and content marketing.",
          isFeatured: true,
          instructor: { name: "Emma Davis", email: "emma@example.com" },
          createdAt: new Date(),
          enrolledCount: 178
        }
      ];
      
      await db.collection('courses').insertMany(sampleCourses);
      console.log('✅ Sample courses added to database');
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

connectDB().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`💾 Database: ${isConnected ? 'Connected' : 'Disconnected'}`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});