'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './premium_course_form.css'; // Importing the premium CSS

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // সবগুলো ফিল্ডের জন্য State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lessons: [] as string[],
    quizzes: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);

  // ডাটাবেস থেকে লেসন ও কুইজ আনার জন্য State
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);

  // পেজ লোড হলে লেসন এবং কুইজগুলো ডাটাবেস থেকে নিয়ে আসবে
  useEffect(() => {
    const fetchData = async () => {
      let jwt = localStorage.getItem('jwt');
      if (!jwt) return;

      try {
        const headers = { 'Authorization': `Bearer ${jwt}` };
        
        // Fetch Lessons
        const lessonRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/lessons`, { headers });
        const lessonData = await lessonRes.json();
        if (lessonData?.data) setAvailableLessons(lessonData.data);

        // Fetch Quizzes
        const quizRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/quizzes`, { headers });
        const quizData = await quizRes.json();
        if (quizData?.data) setAvailableQuizzes(quizData.data);
      } catch (error) {
        console.error("Failed to fetch related data", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Multiple Select এর জন্য স্পেশাল ফাংশন
  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: string) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, [field]: selectedValues });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let jwt = localStorage.getItem('jwt');
      const userStr = localStorage.getItem('user');
      
      if (!jwt) {
        alert("Please login as Admin to create a course!");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr || '{}');
      let uploadedImageId = null;

      // 1. Cover Image Upload
      if (file) {
        const imageFormData = new FormData();
        imageFormData.append('files', file);

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwt}` },
          body: imageFormData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData && uploadData.length > 0) {
          uploadedImageId = uploadData[0].id; 
        }
      }

      // 2. Prepare Description Blocks
      const blocksDescription = [
        {
          type: "paragraph",
          children: [{ type: "text", text: formData.description || "" }]
        }
      ];

      // 3. Prepare Final Data Object (সবগুলো ফিল্ড একসাথে)
      const courseData: any = {
        title: formData.title,
        description: blocksDescription,
        instructor: user.id, // Instructor অটোমেটিকালি অ্যাড হচ্ছে
      };

      if (uploadedImageId) courseData.coverImage = uploadedImageId;
      if (formData.lessons.length > 0) courseData.lessons = formData.lessons;
      if (formData.quizzes.length > 0) courseData.quizzes = formData.quizzes;

      // 4. Send to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: courseData }),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert('🎉 Course created with all relations successfully!');
        router.push('/admin/courses');
      } else {
        console.error("Strapi Error:", responseData);
        alert(`Error: ${responseData.error?.message || 'Failed to create course'}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert('Network error! Make sure Strapi is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-form-container">
      <h1 className="premium-form-title">Create a New Course</h1>
      <p className="premium-form-subtitle">Complete all fields to publish your course.</p>
      
      <form onSubmit={handleSubmit}>
        
        {/* Title */}
        <div className="form-group">
          <label className="premium-label">Course Title <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="premium-input"
            placeholder="e.g. Master Next.js 14"
          />
        </div>

        {/* Cover Image Upload */}
        <div className="form-group">
          <label className="premium-label">Cover Image</label>
          <div className="file-upload-wrapper">
             <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="file-upload-content">
                  <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <span className="upload-text">Click or drag image to upload</span>
              </div>
          </div>
          {file && (
             <div className="file-name-display">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                {file.name}
             </div>
          )}
        </div>

        {/* Lessons (Multi-select) */}
        <div className="form-group">
          <label className="premium-label">Attach Lessons (Hold Ctrl/Cmd to select multiple)</label>
          <select 
            multiple
            name="lessons"
            onChange={(e) => handleMultiSelect(e, 'lessons')}
            className="premium-input"
            style={{ height: '100px' }}
          >
            {availableLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.documentId || lesson.id}>
                {lesson.title || `Lesson ${lesson.id}`}
              </option>
            ))}
          </select>
          {availableLessons.length === 0 && <p className="text-xs text-gray-500 mt-1">No lessons available in database yet.</p>}
        </div>

        {/* Quizzes (Multi-select) */}
        <div className="form-group">
          <label className="premium-label">Attach Quizzes (Hold Ctrl/Cmd to select multiple)</label>
          <select 
            multiple
            name="quizzes"
            onChange={(e) => handleMultiSelect(e, 'quizzes')}
            className="premium-input"
            style={{ height: '100px' }}
          >
            {availableQuizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.documentId || quiz.id}>
                {quiz.title || `Quiz ${quiz.id}`}
              </option>
            ))}
          </select>
          {availableQuizzes.length === 0 && <p className="text-xs text-gray-500 mt-1">No quizzes available in database yet.</p>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="premium-label">Course Description</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="premium-textarea"
            placeholder="Write details about this course..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="premium-submit-btn"
        >
          {loading ? 'Publishing Course...' : 'Publish Course'}
        </button>
      </form>
    </div>
  );
}