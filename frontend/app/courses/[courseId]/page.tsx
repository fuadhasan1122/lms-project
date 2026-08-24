'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Fetch single entry by documentId, and populate=* to get the lessons
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/courses/${courseId}?populate=*`);
        const data = await response.json();
        
        // Check if data exists and set it (No .attributes needed in Strapi v5!)
        if (data.data) {
          setCourse(data.data); 
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading course details...</div>;
  if (!course) return <div className="p-6 text-center text-red-500">Course not found.</div>;

  const displayDescription = typeof course.description === 'string' 
    ? course.description 
    : 'No description available.';

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-900">{course.title}</h1>
      <p className="text-gray-700 mb-8 text-lg">{displayDescription}</p>
      
      {/* Lesson List */}
      {course.lessons && course.lessons.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Course Lessons</h2>
          <ul className="space-y-4">
            {course.lessons.map((lesson: any) => (
              <li key={lesson.documentId || lesson.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-800">{lesson.title}</h3>
                <Link 
                  href={`/courses/${courseId}/lessons/${lesson.documentId || lesson.id}`}
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition"
                >
                  Start Lesson
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg text-yellow-800">
          No lessons are available for this course yet.
        </div>
      )}
    </div>
  );
}