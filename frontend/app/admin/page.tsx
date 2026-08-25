'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, students: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const jwt = localStorage.getItem('jwt');
        const headers = { 'Authorization': `Bearer ${jwt}` };

        // Strapi থেকে Courses আনা হচ্ছে
        const courseRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/courses`, { headers });
        const courseData = await courseRes.json();
        
        // Strapi থেকে Users (Students) আনা হচ্ছে
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users`, { headers });
        const userData = await userRes.json();

        setStats({
          courses: courseData?.data?.length || 0,
          students: userData?.length || 0, // Strapi default users API returns array directly
          revenue: 0 // আপাতত রেভিনিউ ০ রাখছি, পেমেন্ট সিস্টেম থাকলে এটি ডাইনামিক করা যাবে
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading live data...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-500 mb-2 font-medium">Total Courses</span>
          <span className="text-4xl font-bold text-blue-600">{stats.courses}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-500 mb-2 font-medium">Total Students</span>
          <span className="text-4xl font-bold text-green-600">{stats.students}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-500 mb-2 font-medium">Total Revenue</span>
          <span className="text-4xl font-bold text-purple-600">${stats.revenue}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link href="/admin/courses/create" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
            + Create New Course
          </Link>
          <Link href="/admin/courses" className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
            View All Courses
          </Link>
        </div>
      </div>
    </div>
  );
}