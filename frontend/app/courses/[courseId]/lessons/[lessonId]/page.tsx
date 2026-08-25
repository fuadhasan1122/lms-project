'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // Fetch the specific lesson from Strapi
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/lessons/${lessonId}`);
        const data = await response.json();
        
        if (data.data) {
          setLesson(data.data);
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // Lesson কমপ্লিট করার ফাংশন (Progress API কল)
 const handleComplete = async () => {
    setCompleting(true);
    try {
      // লোকাল স্টোরেজ থেকে ইউজার এবং টোকেন নেওয়ার চেষ্টা
      const userStr = localStorage.getItem('user');
      let jwt = localStorage.getItem('jwt'); // প্রথমে লোকাল স্টোরেজে খুঁজবে
      
      if (!jwt) {
        // না পেলে কুকিতে খুঁজবে
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
        };
        jwt = getCookie('jwt') || '';
      }

      if (!userStr || !jwt) {
        alert("Please login first to save your progress!");
        router.push('/login');
        return;
      }

      const user = JSON.parse(userStr);
      const lessonIdToSave = lesson.documentId || lesson.id;

      console.log("Sending Data:", { user: user.id, lesson: lessonIdToSave });

      // API Call
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/progresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`, 
        },
       body: JSON.stringify({
          data: {
            is_completed: true,
            user: user.id,      
            lesson: lesson.documentId || lesson.id 
          }
        })
      });

      // Response চেক করা
      const responseData = await response.json();

      if (response.ok) {
        alert('🎉 Awesome job! Lesson marked as complete.');
        router.push(`/courses/${courseId}`);
      } else {
        // যদি এরর হয়, তাহলে কনসোলে এবং স্ক্রিনে দেখাবে
        console.error('Strapi Error Details:', responseData);
        alert(`Error: ${responseData.error?.message || 'Something went wrong. Check Console.'}`);
      }
    } catch (error) {
      console.error('Network or Parsing Error:', error);
      alert('Network error! Is Strapi running?');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600 text-lg">Loading lesson content...</div>;
  if (!lesson) return <div className="p-8 text-center text-red-500 text-lg">Lesson not found.</div>;

  // Safely extract text from Strapi v5 Rich Text blocks for the lesson content
  const displayContent = Array.isArray(lesson.content)
    ? lesson.content.map((block: any, index: number) => {
        return (
          <p key={index} className="mb-4">
            {block.children ? block.children.map((c: any) => c.text).join('') : ''}
          </p>
        );
      })
    : <p className="whitespace-pre-wrap">{lesson.content || 'No text content available for this lesson.'}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      {/* Back Button */}
      <Link 
        href={`/courses/${courseId}`}
        className="inline-block mb-6 text-blue-600 hover:text-blue-800 font-semibold"
      >
        &larr; Back to Course Outline
      </Link>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">{lesson.title}</h1>
          
          {/* Video Player Section */}
          {lesson.videoUrl && (
            <div className="mb-10 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 p-8">
              <a 
                href={lesson.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 font-semibold flex flex-col items-center hover:text-blue-800 transition"
              >
                <span className="text-5xl mb-3">▶️</span>
                Click here to watch the lesson video
              </a>
            </div>
          )}

          {/* Lesson Content Section */}
          <div className="text-gray-700 text-lg leading-relaxed mb-10 border-l-4 border-blue-500 pl-4">
            {displayContent}
          </div>

          {/* Mark as Complete Button */}
          <div className="pt-8 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleComplete}
              disabled={completing}
              className={`px-8 py-3 rounded-lg font-bold text-white transition shadow-sm ${
                completing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
              }`}
            >
              {completing ? 'Saving...' : 'Mark as Complete ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}