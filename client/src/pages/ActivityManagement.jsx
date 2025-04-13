import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { Download, MoreVertical } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

function ActivityManagement() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 5;
  const [showDropdown, setShowDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchActivities();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(null);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await API.get("/activities");
      setActivities(res.data.data || res.data);
    } catch (error) {
      toast.error("Error fetching activities");
    }
    setLoading(false);
  };

  const exportCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "activities.csv");
    toast.success("CSV exported successfully 🎉");
  };

  const deleteActivity = async (activityId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Activity log will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/activities/${activityId}`);
          toast.success("Activity deleted successfully");
          fetchActivities();
        } catch (error) {
          toast.error("Error deleting activity");
        }
      }
    });
  };

  const filteredActivities = activities.filter((activity) =>
    activity.action?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold mr-2">Activity Management</h2>
            <span role="img" aria-label="activity">📝</span>
          </div>
          <p className="text-gray-600 mb-6">View and manage all system activities here.</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Activities</p>
              <p className="text-2xl font-bold">{activities.length}</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6 space-y-3 md:space-y-0">
            <input
              type="text"
              placeholder="Search by action"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <button
              onClick={() => exportCSV(activities)}
              className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Details</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentActivities.length === 0 ? (
                  <tr><td className="p-4 text-center" colSpan="5">No activities found.</td></tr>
                ) : (
                  currentActivities.map(activity => (
                    <tr key={activity._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{activity.user || "System"}</td>
                      <td className="p-3">{activity.action}</td>
                      <td className="p-3">{activity.details || "N/A"}</td>
                      <td className="p-3">{new Date(activity.createdAt).toLocaleString()}</td>
                      <td className="p-3 relative" ref={dropdownRef}>
                        <button onClick={() => setShowDropdown(showDropdown === activity._id ? null : activity._id)}>
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {showDropdown === activity._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                            <div onClick={() => exportCSV([activity])} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Export CSV</div>
                            <div onClick={() => deleteActivity(activity._id)} className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer">Delete Activity</div>
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
        </>
      )}
    </div>
  );
}

export default ActivityManagement;