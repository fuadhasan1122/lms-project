'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/src/lib/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, enrollments: 0 });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Fetch all users with their current roles
        const usersRes = await fetchWithAuth('/api/users?populate=role');
        setUsers(usersRes);

        // Fetch roles to populate the dropdowns
        const rolesRes = await fetchWithAuth('/api/users-permissions/roles');
        setRoles(rolesRes.roles || []);

        // Fetch basic stats (courses and enrollments)
        const coursesRes = await fetchWithAuth('/api/courses');
        const enrollmentsRes = await fetchWithAuth('/api/enrollments');
        
        setStats({
          courses: coursesRes.meta?.pagination?.total || coursesRes.data?.length || 0,
          enrollments: enrollmentsRes.meta?.pagination?.total || enrollmentsRes.data?.length || 0,
        });
      } catch (err) {
        setError('Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      // Update the user's role on the backend
      await fetchWithAuth(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRoleId }),
      });
      alert('User role updated successfully!');
      // Update local state to reflect change immediately
      setUsers(users.map((u: any) => u.id === userId ? { ...u, role: { id: newRoleId } } : u));
    } catch (err) {
      alert('Failed to update user role.');
    }
  };

  if (loading) return <div className="p-6">Loading admin control panel...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Admin Dashboard</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.courses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Enrollments</h3>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats.enrollments}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Users</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Email</th>
              <th className="p-3">Username</th>
              <th className="p-3">Current Role</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.username}</td>
                <td className="p-3">{user.role?.name || 'None'}</td>
                <td className="p-3">
                  <select 
                    className="border rounded p-1 text-sm"
                    defaultValue={user.role?.id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="" disabled>Change Role</option>
                    {roles.map((role: any) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}