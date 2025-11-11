const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://Online-Learning:883fT8J671i9iPhP@cluster0.xdad6f7.mongodb.net/?appName=Cluster0";

const sampleCourses = [
  {
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming",
    category: "Programming",
    price: 49.99,
    duration: "4 weeks",
    instructor: "John Doe",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
    featured: true,
    rating: 4.8,
    enrolled: 1250
  },
  {
    title: "React Development",
    description: "Build modern web applications with React",
    category: "Web Development",
    price: 79.99,
    duration: "6 weeks",
    instructor: "Jane Smith",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    featured: true,
    rating: 4.9,
    enrolled: 980
  },
  {
    title: "Node.js Backend",
    description: "Create server-side applications with Node.js",
    category: "Backend",
    price: 69.99,
    duration: "5 weeks",
    instructor: "Mike Johnson",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
    featured: false,
    rating: 4.7,
    enrolled: 756
  },
  {
    title: "Python for Beginners",
    description: "Start your programming journey with Python",
    category: "Programming",
    price: 39.99,
    duration: "3 weeks",
    instructor: "Sarah Wilson",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
    featured: true,
    rating: 4.6,
    enrolled: 1450
  },
  {
    title: "MongoDB Database",
    description: "Master NoSQL database with MongoDB",
    category: "Database",
    price: 59.99,
    duration: "4 weeks",
    instructor: "David Brown",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    featured: false,
    rating: 4.5,
    enrolled: 623
  },
  {
    title: "CSS & Tailwind",
    description: "Modern CSS styling with Tailwind CSS",
    category: "Web Development",
    price: 45.99,
    duration: "3 weeks",
    instructor: "Emily Davis",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    featured: true,
    rating: 4.7,
    enrolled: 890
  },
  {
    title: "Express.js API",
    description: "Build RESTful APIs with Express.js",
    category: "Backend",
    price: 65.99,
    duration: "5 weeks",
    instructor: "Tom Anderson",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    featured: false,
    rating: 4.8,
    enrolled: 567
  },
  {
    title: "Vue.js Framework",
    description: "Progressive JavaScript framework Vue.js",
    category: "Web Development",
    price: 75.99,
    duration: "6 weeks",
    instructor: "Lisa Chen",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    featured: false,
    rating: 4.6,
    enrolled: 445
  },
  {
    title: "Docker Containers",
    description: "Containerization with Docker",
    category: "DevOps",
    price: 89.99,
    duration: "4 weeks",
    instructor: "Mark Taylor",
    image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400",
    featured: true,
    rating: 4.9,
    enrolled: 678
  },
  {
    title: "AWS Cloud Basics",
    description: "Introduction to Amazon Web Services",
    category: "Cloud Computing",
    price: 99.99,
    duration: "7 weeks",
    instructor: "Alex Kumar",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
    featured: true,
    rating: 4.8,
    enrolled: 1123
  }
];

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
  },
  {
    name: "John Student",
    email: "student@example.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
  },
  {
    name: "David Brown",
    email: "david@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
  },
  {
    name: "Emily Davis",
    email: "emily@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
  },
  {
    name: "Tom Anderson",
    email: "tom@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
  },
  {
    name: "Lisa Chen",
    email: "lisa@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100"
  },
  {
    name: "Mark Taylor",
    email: "mark@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100"
  },
  {
    name: "Alex Kumar",
    email: "alex@example.com",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"
  },
  {
    name: "Maria Garcia",
    email: "maria@example.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"
  },
  {
    name: "James Wilson",
    email: "james@example.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
  },
  {
    name: "Anna Johnson",
    email: "anna@example.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
  },
  {
    name: "Robert Lee",
    email: "robert@example.com",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
  }
];

async function seedData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('online-learning-platform');
    
    // Clear existing data
    await db.collection('courses').deleteMany({});
    await db.collection('users').deleteMany({});
    
    // Insert sample data
    await db.collection('courses').insertMany(sampleCourses);
    await db.collection('users').insertMany(sampleUsers);
    
    console.log('✅ Sample data inserted successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seedData();