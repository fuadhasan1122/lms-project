'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api'; 

export default function InstructorDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInstructorCourses = async () => {
      try {
        // Fetch courses. The backend should strictly filter this using the JWT 
        // to only return courses where instructor_id matches the logged-in user.
        const response = await fetchWithAuth('/api/courses?populate=lessons');
        
        if (response.data) {
          setMyCourses(response.data);
        } else {
          setError('Could not load your courses.');
        }
      } catch (err) {
        setError('An error occurred while fetching your courses.');
      } finally {
        setLoading(false);
      }
    };

    loadInstructorCourses();
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading your dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Instructor Dashboard</h1>
        <Link 
          href="/dashboard/instructor/courses/new" 
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          + Create New Course
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {myCourses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <p className="text-gray-600 mb-4">You have not created any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myCourses.map((course: any) => {
            const { title, description, lessons } = course.attributes;
            const lessonCount = lessons?.data?.length || 0;

            return (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col">
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
                <div className="text-sm text-gray-500 mb-6">
                  <strong>{lessonCount}</strong> Lessons published
                </div>
                
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link 
                    href={`/dashboard/instructor/courses/${course.id}/edit`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                  >
                    Manage Content
                  </Link>
                  <Link 
                    href={`/dashboard/instructor/courses/${course.id}/progress`}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                  >
                    View Student Progress
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}