import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-900">Welcome to the LMS Platform</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl">
        A complete Learning Management System built for students, instructors, and content managers.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
        <Link 
          href="/courses" 
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md font-semibold hover:bg-blue-50 transition"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  );
}