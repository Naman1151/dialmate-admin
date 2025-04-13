import React, { useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';

function UserProfileModal({ user, onClose, fetchUsers }) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [updating, setUpdating] = useState(false);

  const updateUserStatus = async () => {
    try {
      setUpdating(true);
      await API.put('/users/status', { userId: user._id, status: user.status === 'active' ? 'inactive' : 'active' });
      toast.success('User status updated successfully');
      fetchUsers();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error updating user status');
    } finally {
      setUpdating(false);
    }
  };

  const updateUserRole = async () => {
    try {
      setUpdating(true);
      await API.put('/users/role', { userId: user._id, role: selectedRole });
      toast.success('User role updated successfully');
      fetchUsers();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error updating user role');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h3 className="text-lg font-semibold mb-4">User Details</h3>
        <p><strong>Name:</strong> {user.name || 'N/A'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
        <p><strong>User ID:</strong> {user._id}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleString()}</p>

        {/* Update Role Dropdown */}
        <div className="my-3">
          <label className="block mb-1">Update Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
          <button
            onClick={updateUserRole}
            disabled={updating}
            className="bg-blue-600 text-white w-full mt-2 py-2 rounded"
          >
            Update Role
          </button>
        </div>

        {/* Update Status Button */}
        <button
          onClick={updateUserStatus}
          disabled={updating}
          className={`w-full py-2 mt-2 rounded ${
            user.status === 'active' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          Set {user.status === 'active' ? 'Inactive' : 'Active'}
        </button>
      </div>
    </div>
  );
}

export default UserProfileModal;