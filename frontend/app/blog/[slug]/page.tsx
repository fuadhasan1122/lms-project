'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SingleBlogPage({ params }: { params: { slug: string } }) {
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSingleBlog = async () => {
      try {
        // Fetch the specific blog post using the dynamic slug (ID) from the URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blogs/${params.slug}`);
        const data = await response.json();
        
        if (data.data) {
          // Strict enforcement: Only render if the status is actually 'Published'
          if (data.data.attributes.status === 'Published') {
            setBlog(data.data);
          } else {
            setError('This post is currently a draft and cannot be viewed.');
          }
        } else {
           setError('Blog post not found.');
        }
      } catch (err) {
        setError('Failed to load the blog post.');
      } finally {
        setLoading(false);
      }
    };

    fetchSingleBlog();
  }, [params.slug]);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading article...</div>;
  if (error) return <div className="p-6 text-center text-red-600 font-semibold">{error}</div>;
  if (!blog) return null;

  const { title, body, coverImageUrl, createdAt } = blog.attributes;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-sm border border-gray-200">
      <Link href="/blog" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to all posts
      </Link>
      
      {coverImageUrl && (
        <img 
          src={coverImageUrl} 
          alt={title} 
          className="w-full h-64 object-cover rounded-lg mb-8" 
        />
      )}
      
      <h1 className="text-4xl font-bold mb-4 text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mb-8">
        Published on {new Date(createdAt).toLocaleDateString()}
      </p>
      
      <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
        {body}
      </div>
    </div>
  );
}