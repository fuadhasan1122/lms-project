'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyCourses = async () => {
      try {
        // Fetch enrollments for the logged-in student, populating the related course details
        // Note: You will need to restrict this on the Strapi backend later so a student only gets THEIR enrollments.
        const response = await fetchWithAuth('/api/enrollments?populate=course');
        setEnrollments(response.data || []);
      } catch (error) {
        console.error('Failed to load courses', error);
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading your courses...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-blue-900">My Courses</h1>
      
      {enrollments.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">You are not enrolled in any courses yet.</p>
          <Link href="/courses" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Browse Available Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment: any) => {
            // Strapi v4 nests data inside 'attributes'
            const courseData = enrollment.attributes?.course?.data;
            if (!courseData) return null;

            return (
              <div key={enrollment.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-2">{courseData.attributes.title}</h2>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {courseData.attributes.description}
                </p>
                <Link 
                  href={`/courses/${courseData.id}/lessons`} 
                  className="mt-auto block text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Continue Learning
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}