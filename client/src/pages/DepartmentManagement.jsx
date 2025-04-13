// src/pages/DepartmentManagement.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { Download, MoreVertical } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const departmentsPerPage = 5;
  const [showDropdown, setShowDropdown] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchDepartments();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(null);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/departments");
      const data = res.data.data || res.data;
      setDepartments(Array.isArray(data) ? data : []); // ✅ Ensure it's an array
    } catch (err) {
      toast.error("Error fetching departments");
      setDepartments([]); // ✅ Prevent null error
    }
    setLoading(false);
  };

  const exportCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "departments.csv");
    toast.success("CSV exported successfully 🎉");
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newDepartment = { name: form.name.value };

    try {
      await API.post("/departments", newDepartment);
      toast.success("Department added successfully");
      setShowAddModal(false);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding department");
    }
  };

  const deleteDepartment = async (departmentId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Department will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/departments/${departmentId}`);
          toast.success("Department deleted successfully");
          fetchDepartments();
        } catch (error) {
          toast.error("Error deleting department");
        }
      }
    });
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastDept = currentPage * departmentsPerPage;
  const indexOfFirstDept = indexOfLastDept - departmentsPerPage;
  const currentDepartments = filteredDepartments.slice(
    indexOfFirstDept,
    indexOfLastDept
  );
  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold mr-2">Department Management</h2>
            <span role="img" aria-label="departments">🏢</span>
          </div>
          <p className="text-gray-600 mb-6">Manage all departments here.</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Departments</p>
              <p className="text-2xl font-bold">{departments.length}</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6 space-y-3 md:space-y-0">
            <input
              type="text"
              placeholder="Search by department name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <button
              onClick={() => exportCSV(departments)}
              className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800"
            >
              + Add Department
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Department Name</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDepartments.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center" colSpan="2">No departments found.</td>
                  </tr>
                ) : (
                  currentDepartments.map(dept => (
                    <tr key={dept._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{dept.name || "N/A"}</td>
                      <td className="p-3 relative" ref={dropdownRef}>
                        <button
                          onClick={() => setShowDropdown(showDropdown === dept._id ? null : dept._id)}
                          className="text-gray-600"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {showDropdown === dept._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                            <div
                              onClick={() => exportCSV([dept])}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              Export CSV
                            </div>
                            <div
                              onClick={() => deleteDepartment(dept._id)}
                              className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                            >
                              Delete Department
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
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Add Department Modal */}
          {showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
                <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
                <form onSubmit={handleAddDepartment} className="space-y-3">
                  <input name="name" placeholder="Department Name" required className="border p-2 rounded w-full" />
                  <button type="submit" className="w-full bg-black text-white py-2 rounded">
                    Add Department
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DepartmentManagement;