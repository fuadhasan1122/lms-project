'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function QuizPage() {
  const { courseId } = useParams();
  const router = useRouter();
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Course-এর সাথে যুক্ত কুইজগুলো ফেচ করা
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/courses/${courseId}?populate=quizzes`);
        const data = await response.json();
        
        if (data.data?.quizzes) {
          setQuizzes(data.data.quizzes);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  // স্টুডেন্ট কোনো অপশন সিলেক্ট করলে স্টেট আপডেট হবে
  const handleOptionChange = (quizId: string, selectedOption: string) => {
    setAnswers(prev => ({
      ...prev,
      [quizId]: selectedOption
    }));
  };

  // সাবমিট করলে রেজাল্ট ক্যালকুলেশন
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correctCount = 0;

    quizzes.forEach((quiz) => {
      const quizId = quiz.documentId || quiz.id;
      // ইউজারের উত্তরের সাথে সঠিক উত্তর মেলানো
      if (answers[quizId] === quiz.correct_answer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quizzes.length) * 100);
    setScore(finalScore);
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading quizzes...</div>;
  if (quizzes.length === 0) return <div className="p-8 text-center text-red-500">No quizzes available for this course.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8">
      <Link href={`/courses/${courseId}`} className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Course
      </Link>
      
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Course Final Quiz</h1>

        {score === null ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            {quizzes.map((quiz, index) => {
              const quizId = quiz.documentId || quiz.id;
              // JSON অপশনগুলো পার্স করা (যদি স্ট্রিং হিসেবে আসে)
              let options = [];
              try {
                options = typeof quiz.options === 'string' ? JSON.parse(quiz.options) : quiz.options;
              } catch(e) { console.error("Error parsing options"); }

              return (
                <div key={quizId} className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">{index + 1}. {quiz.question}</h3>
                  <div className="space-y-3">
                    {Array.isArray(options) && options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name={`quiz-${quizId}`} 
                          value={opt}
                          onChange={() => handleOptionChange(quizId, opt)}
                          required
                          className="h-5 w-5 text-blue-600"
                        />
                        <span className="text-gray-700 text-lg">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Answers
            </button>
          </form>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <div className={`text-6xl font-black mb-6 ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {score}%
            </div>
            <p className="text-gray-600 text-lg mb-8">
              {score >= 80 ? 'Excellent job! You mastered this course.' : 'Good effort! You might want to review some lessons.'}
            </p>
            <button onClick={() => setScore(null)} className="text-blue-600 underline">Retake Quiz</button>
          </div>
        )}
      </div>
    </div>
  );
}