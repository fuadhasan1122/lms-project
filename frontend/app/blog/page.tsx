'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublishedBlogs = async () => {
      try {
        // STRICT FILTER: Only fetch blogs where status is 'Published'
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blogs?filters[status][$eq]=Published`);
        const data = await response.json();
        setBlogs(data.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedBlogs();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading articles...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-blue-900">LMS Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog: any) => (
          <div key={blog.id} className="bg-white p-6 rounded-lg shadow border flex flex-col">
            {blog.attributes.coverImageUrl && (
              <img src={blog.attributes.coverImageUrl} alt="Cover" className="w-full h-40 object-cover rounded mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-2">{blog.attributes.title}</h2>
            <p className="text-gray-600 line-clamp-3 mb-4">{blog.attributes.body}</p>
            <Link href={`/blog/${blog.id}`} className="mt-auto text-blue-600 font-semibold hover:underline">
              Read More &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}