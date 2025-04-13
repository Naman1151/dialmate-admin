import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { Download, MoreVertical } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

function CallManagement() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const callsPerPage = 5;
  const [showDropdown, setShowDropdown] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCalls();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(null);
    }
  };

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await API.get("/calls");
      const apiData = res.data.data;
      // 🟢 Make sure to safely get the array
      const callsArray = Array.isArray(apiData) ? apiData : apiData.calls || [];
      setCalls(callsArray);
    } catch (error) {
      toast.error("Error fetching calls");
    }
    setLoading(false);
  };

  const exportCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "calls.csv");
    toast.success("CSV exported successfully 🎉");
  };

  const handleAddCall = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newCall = {
      callerName: form.callerName.value,
      type: form.type.value,
      duration: form.duration.value,
      date: form.date.value,
    };

    try {
      await API.post("/calls", newCall);
      toast.success("Call log added successfully");
      setShowAddModal(false);
      fetchCalls();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding call log");
    }
  };

  const deleteCall = async (callId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Call log will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/calls/${callId}`);
          toast.success("Call log deleted successfully");
          fetchCalls();
        } catch (error) {
          toast.error("Error deleting call log");
        }
      }
    });
  };

  const filteredCalls = calls.filter((call) =>
    call.callerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastCall = currentPage * callsPerPage;
  const indexOfFirstCall = indexOfLastCall - callsPerPage;
  const currentCalls = filteredCalls.slice(indexOfFirstCall, indexOfLastCall);
  const totalPages = Math.ceil(filteredCalls.length / callsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold mr-2">Call Management</h2>
            <span role="img" aria-label="calls">📞</span>
          </div>
          <p className="text-gray-600 mb-6">Manage call logs and details here.</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Calls</p>
              <p className="text-2xl font-bold">{calls.length}</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm text-center">
              <p className="text-gray-500 text-sm">Incoming Calls</p>
              <p className="text-2xl font-bold">{calls.filter(c => c.type === "incoming").length}</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm text-center">
              <p className="text-gray-500 text-sm">Outgoing Calls</p>
              <p className="text-2xl font-bold">{calls.filter(c => c.type === "outgoing").length}</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6 space-y-3 md:space-y-0">
            <input
              type="text"
              placeholder="Search by caller name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <button
              onClick={() => exportCSV(calls)}
              className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800"
            >
              + Add Call
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Caller Name</th>
                  <th className="p-3 text-left">Call Type</th>
                  <th className="p-3 text-left">Duration (mins)</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCalls.length === 0 ? (
                  <tr><td className="p-4 text-center" colSpan="5">No calls found.</td></tr>
                ) : (
                  currentCalls.map(call => (
                    <tr key={call._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{call.callerName || "Unknown"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          call.type === "incoming" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                        }`}>
                          {call.type}
                        </span>
                      </td>
                      <td className="p-3">{call.duration || "N/A"}</td>
                      <td className="p-3">{new Date(call.date).toLocaleString()}</td>
                      <td className="p-3 relative" ref={dropdownRef}>
                        <button onClick={() => setShowDropdown(showDropdown === call._id ? null : call._id)}>
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {showDropdown === call._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                            <div onClick={() => exportCSV([call])} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Export CSV</div>
                            <div onClick={() => deleteCall(call._id)} className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer">Delete Call</div>
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

          {/* Add Call Modal */}
          {showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
                <h3 className="text-lg font-semibold mb-4">Add New Call</h3>
                <form onSubmit={handleAddCall} className="space-y-3">
                  <input name="callerName" placeholder="Caller Name" required className="border p-2 rounded w-full" />
                  <input name="duration" placeholder="Duration in minutes" type="number" required className="border p-2 rounded w-full" />
                  <input name="date" placeholder="Date & Time" type="datetime-local" required className="border p-2 rounded w-full" />
                  <select name="type" required className="border p-2 rounded w-full">
                    <option value="incoming">Incoming</option>
                    <option value="outgoing">Outgoing</option>
                  </select>
                  <button type="submit" className="w-full bg-black text-white py-2 rounded">
                    Add Call
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

export default CallManagement;