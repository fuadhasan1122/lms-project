'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/src/lib/api'; // Adjust path as needed

export default function LessonPage({ params }: { params: { courseId: string, lessonId: string } }) {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetchWithAuth(`/api/lessons/${params.lessonId}`);
        setLesson(response.data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [params.lessonId]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await fetchWithAuth('/api/progresses', {
        method: 'POST',
        body: JSON.stringify({
          data: {
            lesson: params.lessonId,
            course: params.courseId,
            is_completed: true
          }
        })
      });
      setIsCompleted(true);
    } catch (error) {
      console.error('Failed to mark complete', error);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) return <div className="p-6">Loading lesson...</div>;
  if (!lesson) return <div className="p-6">Lesson not found.</div>;

  const { title, content, videoUrl } = lesson.attributes;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">{title}</h1>
      
      {videoUrl && (
        <div className="mb-6">
          <iframe 
            className="w-full aspect-video rounded" 
            src={videoUrl} 
            title="Lesson Video" 
            allowFullScreen 
          />
        </div>
      )}
      
      <div className="prose mb-8 text-gray-800" dangerouslySetInnerHTML={{ __html: content }} />

      <button 
        onClick={handleMarkComplete}
        disabled={isCompleted || markingComplete}
        className={`px-6 py-2 text-white font-bold rounded ${
          isCompleted ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isCompleted ? 'Completed' : (markingComplete ? 'Saving...' : 'Mark as Complete')}
      </button>
    </div>
  );
}