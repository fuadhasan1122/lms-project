'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 1. Fetch public course data from the Strapi API
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/courses`);
        const data = await response.json();
        setCourses(data.data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading courses...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Available Courses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => {
          // Strapi v5 flattened data structure (no .attributes wrapper needed)
          const { title, description, id, documentId } = course;
          
          // Safety check: if description is a Rich Text array in v5, render a fallback string
          const displayDescription = typeof description === 'string' 
            ? description 
            : 'Click to view full course details.';

          return (
            <div key={id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                {displayDescription}
              </p>
              <Link 
                // Strapi v5 prefers documentId for fetching, with id as a fallback
                href={`/courses/${documentId || id}`}
                className="mt-auto block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                View Details & Enroll
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}