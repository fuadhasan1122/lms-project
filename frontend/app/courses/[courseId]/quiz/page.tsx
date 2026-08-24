'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/src/lib/api'; // Adjust path

export default function QuizPage({ params }: { params: { courseId: string } }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Fetch the quiz associated with this course
        const response = await fetchWithAuth(`/api/quizzes?filters[course][id][$eq]=${params.courseId}`);
        // Assuming one quiz per course for simplicity
        if (response.data && response.data.length > 0) {
          setQuiz(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [params.courseId]);

  const handleSubmit = async () => {
    if (!selectedOption) {
      setError('Please select an answer before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Send the selected answer to a custom backend endpoint for auto-grading
      const response = await fetchWithAuth(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answer: selectedOption })
      });

      if (response.score !== undefined) {
        setScore(response.score);
      } else {
        setError('Failed to grade quiz. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading quiz...</div>;
  if (!quiz) return <div className="p-6">No quiz available for this course yet.</div>;

  const { question, options } = quiz.attributes;
  // Note: 'options' should be a JSON field in Strapi containing an array of strings

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Course Quiz</h1>
      
      {score !== null ? (
        <div className="text-center p-8 bg-green-50 rounded border border-green-200">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Quiz Complete!</h2>
          <p className="text-lg">Your score: <strong>{score}%</strong></p>
          <p className="text-gray-600 mt-4">Your result has been stored.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{question}</h2>
          
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <div className="space-y-3 mb-8">
            {options?.map((option: string, index: number) => (
              <label 
                key={index} 
                className={`block p-4 border rounded cursor-pointer transition ${
                  selectedOption === option ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="quiz-option" 
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mr-3"
                />
                {option}
              </label>
            ))}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3 text-white font-bold rounded transition ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Grading...' : 'Submit Answer'}
          </button>
        </div>
      )}
    </div>
  );
}