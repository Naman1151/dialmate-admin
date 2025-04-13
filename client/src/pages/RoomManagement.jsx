// src/pages/RoomManagement.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { Download, MoreVertical } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 5;
  const [showDropdown, setShowDropdown] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchRooms();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(null);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await API.get("/rooms");
      setRooms(res.data.data || res.data);
    } catch (error) {
      toast.error("Error fetching rooms");
    }
    setLoading(false);
  };

  const exportCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "rooms.csv");
    toast.success("CSV exported successfully 🎉");
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newRoom = {
      roomNumber: form.roomNumber.value,
      capacity: form.capacity.value,
    };

    try {
      await API.post("/rooms", newRoom);
      toast.success("Room added successfully");
      setShowAddModal(false);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding room");
    }
  };

  const deleteRoom = async (roomId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Room will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/rooms/${roomId}`);
          toast.success("Room deleted successfully");
          fetchRooms();
        } catch (error) {
          toast.error("Error deleting room");
        }
      }
    });
  };

  const filteredRooms = rooms.filter((room) =>
    room.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold mr-2">Room Management</h2>
            <span role="img" aria-label="rooms">🛏️</span>
          </div>
          <p className="text-gray-600 mb-6">Manage all rooms here.</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-white rounded shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Rooms</p>
              <p className="text-2xl font-bold">{rooms.length}</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row md:space-x-4 mb-6 space-y-3 md:space-y-0">
            <input
              type="text"
              placeholder="Search by room number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <button
              onClick={() => exportCSV(rooms)}
              className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800"
            >
              + Add Room
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Room Number</th>
                  <th className="p-3 text-left">Capacity</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRooms.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center" colSpan="3">No rooms found.</td>
                  </tr>
                ) : (
                  currentRooms.map(room => (
                    <tr key={room._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{room.roomNumber || "N/A"}</td>
                      <td className="p-3">{room.capacity || "N/A"}</td>
                      <td className="p-3 relative" ref={dropdownRef}>
                        <button
                          onClick={() => setShowDropdown(showDropdown === room._id ? null : room._id)}
                          className="text-gray-600"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {showDropdown === room._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                            <div
                              onClick={() => exportCSV([room])}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              Export CSV
                            </div>
                            <div
                              onClick={() => deleteRoom(room._id)}
                              className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                            >
                              Delete Room
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

          {/* Add Room Modal */}
          {showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
                <h3 className="text-lg font-semibold mb-4">Add New Room</h3>
                <form onSubmit={handleAddRoom} className="space-y-3">
                  <input name="roomNumber" placeholder="Room Number" required className="border p-2 rounded w-full" />
                  <input name="capacity" placeholder="Capacity" type="number" required className="border p-2 rounded w-full" />
                  <button type="submit" className="w-full bg-black text-white py-2 rounded">
                    Add Room
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

export default RoomManagement;