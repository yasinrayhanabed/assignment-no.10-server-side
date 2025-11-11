import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    totalHours: 0
  });

  useEffect(() => {
    if (user?.email) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch(`http://localhost:3001/enroll/${user.email}`);
      const data = await response.json();
      setEnrolledCourses(data);
      
      const completed = data.filter(course => course.progress === 100).length;
      const inProgress = data.filter(course => course.progress > 0 && course.progress < 100).length;
      const totalHours = data.reduce((sum, course) => sum + (course.duration || 0), 0);
      
      setStats({
        totalCourses: data.length,
        completedCourses: completed,
        inProgress: inProgress,
        totalHours: totalHours
      });
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (enrollmentId, newProgress) => {
    try {
      await fetch(`http://localhost:3001/enroll/${enrollmentId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress })
      });
      fetchEnrolledCourses();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.displayName || user?.email}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Courses</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Hours</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalHours}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
          </div>
          
          {enrolledCourses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
              <Link 
                to="/courses" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-6">
                {enrolledCourses.map((enrollment) => (
                  <div key={enrollment._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{enrollment.courseName}</h3>
                        <p className="text-gray-600">Instructor: {enrollment.instructorName}</p>
                        <p className="text-sm text-gray-500">Duration: {enrollment.duration} hours</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-2">Progress</div>
                        <div className="text-2xl font-bold text-blue-600">{enrollment.progress}%</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => updateProgress(enrollment._id, Math.min(enrollment.progress + 10, 100))}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        disabled={enrollment.progress >= 100}
                      >
                        Continue Learning
                      </button>
                      
                      {enrollment.progress === 100 && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                          Download Certificate
                        </button>
                      )}
                      
                      <Link 
                        to={`/courses/${enrollment.courseId}`}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;