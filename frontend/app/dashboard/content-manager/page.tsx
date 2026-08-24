'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/src/lib/api';

export default function ContentManagerDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        // Fetch all blogs to manage them (both Draft and Published)
        const response = await fetchWithAuth('/api/blogs');
        setBlogs(response.data || []);
      } catch (error) {
        console.error('Error loading blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Content Manager Dashboard</h1>
      
      <div className="flex gap-4 mb-10">
        <Link href="/dashboard/content-manager/courses/new" className="px-4 py-2 bg-blue-600 text-white rounded">
          + Create Course
        </Link>
        <Link href="/dashboard/content-manager/blogs/new" className="px-4 py-2 bg-green-600 text-white rounded">
          + Write Blog Post
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Blog Posts</h2>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {blogs.length === 0 ? (
          <p className="text-gray-600">No blog posts created yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog: any) => (
                <tr key={blog.id} className="border-b">
                  <td className="p-3 font-medium">{blog.attributes.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      blog.attributes.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.attributes.status || 'Draft'}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/dashboard/content-manager/blogs/${blog.id}/edit`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}