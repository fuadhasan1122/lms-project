'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // সিম্পল রাউট প্রটেকশন (লগইন ছাড়া কেউ ঢুকতে পারবে না)
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
    } else {
      setIsAdmin(true); // পরে আমরা Strapi Role চেক করে এটি আরও সিকিউর করবো
    }
  }, [router]);

  if (!isAdmin) return <div className="p-10 text-center">Loading admin dashboard...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800 flex justify-center items-center">
          Admin Panel ⚙️
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link 
            href="/admin" 
            className={`block px-4 py-3 rounded-lg transition ${pathname === '/admin' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/admin/courses" 
            className={`block px-4 py-3 rounded-lg transition ${pathname?.includes('/admin/courses') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            📚 Manage Courses
          </Link>
          <Link 
            href="/admin/students" 
            className={`block px-4 py-3 rounded-lg transition ${pathname?.includes('/admin/students') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            👥 Students
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="block text-center px-4 py-2 text-gray-400 hover:text-white transition">
            &larr; Back to Website
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-700">LMS Control Center</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">Hello, Admin 👋</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}