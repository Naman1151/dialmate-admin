// src/pages/UserManagement.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { Download, MoreVertical } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import "../styles.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [showDropdown, setShowDropdown] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(null);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users");
      setUsers(res.data.data || res.data);
    } catch (error) {
      toast.error("Error fetching users");
    }
    setLoading(false);
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await API.put(`/users/status`, { userId, status });
      toast.success(`Status updated to ${status}`);
      fetchUsers();
    } catch (error) {
      toast.error("Error updating user status");
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await API.put(`/users/role`, { userId, role });
      toast.success("Role updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Error updating user role");
    }
  };

  const deleteUser = async (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "User will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/users/${userId}`);
          toast.success("User deleted successfully");
          fetchUsers();
        } catch (error) {
          toast.error("Error deleting user");
        }
      }
    });
  };

  const exportCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users.csv");
    toast.success("CSV exported successfully 🎉");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newUser = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      role: form.role.value,
      status: form.status.value,
      password: form.password.value,
    };

    try {
      await API.post("/users", newUser);
      toast.success("User added successfully");
      setShowAddModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold mr-2">User Management</h2>
            <span role="img" aria-label="users">👥</span>
          </div>
          <p className="text-gray-600 mb-6">Manage your users here.</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", count: users.length },
              { label: "Active Users", count: users.filter(u => u.status === "active").length },
              { label: "Inactive Users", count: users.filter(u => u.status === "inactive").length },
              { label: "Admins", count: users.filter(u => u.role === "admin").length },
            ].map((card, idx) => (
              <div key={idx} className="p-4 bg-white rounded shadow-sm text-center">
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="text-2xl font-bold">{card.count}</p>
              </div>
            ))}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6 space-y-3 md:space-y-0">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            >
              <option value="">All Roles ({users.length})</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            <button
              onClick={() => exportCSV(users)}
              className="btn-export"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-add-user"
            >
              + Add User
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr><td className="p-4 text-center" colSpan="4">No users found.</td></tr>
                ) : (
                  currentUsers.map(user => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name || "N/A"}</span>
                          <span className="text-gray-500 text-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="border rounded p-1 text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                          <option value="customer">Customer</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3 relative" ref={dropdownRef}>
                        <button onClick={() => setShowDropdown(showDropdown === user._id ? null : user._id)}>
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {showDropdown === user._id && (
                          <div className="dropdown-menu">
                            <div onClick={() => exportCSV([user])} className="dropdown-item">Export CSV</div>
                            <div onClick={() => updateUserStatus(user._id, user.status === "active" ? "inactive" : "active")} className="dropdown-item">
                              {user.status === "active" ? "Set Inactive" : "Set Active"}
                            </div>
                            <div onClick={() => deleteUser(user._id)} className="dropdown-item text-red-600">
                              Delete User
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {/* Add User Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="modal-close"
                >
                  ✖
                </button>
                <h3 className="modal-title">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-3">
                  <input name="name" placeholder="Name" required className="modal-input" />
                  <input name="email" placeholder="Email" type="email" required className="modal-input" />
                  <input name="phone" placeholder="Phone" className="modal-input" />
                  <input name="password" placeholder="Password" type="password" required className="modal-input" />
                  <select name="role" required className="modal-input">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                  <select name="status" required className="modal-input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button type="submit" className="modal-submit">
                    Add User
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserManagement;