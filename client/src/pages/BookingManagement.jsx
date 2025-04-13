// src/pages/BookingManagement.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { Download, MoreVertical } from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const bookingsPerPage = 5;
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchBookings();
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(null);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get("/bookings");
      setBookings(res.data.data || []);
    } catch (error) {
      toast.error("Error fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (data) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "bookings.csv");
    toast.success("CSV exported successfully 🎉");
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newBooking = {
      customerName: form.customerName.value,
      roomId: form.roomId.value,
      status: form.status.value,
      date: form.date.value,
    };

    try {
      await API.post("/bookings", newBooking);
      toast.success("Booking added successfully");
      setShowAddModal(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding booking");
    }
  };

  const deleteBooking = async (bookingId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Booking will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await API.delete(`/bookings/${bookingId}`);
        toast.success("Booking deleted successfully");
        fetchBookings();
      } catch (error) {
        toast.error("Error deleting booking");
      }
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold mr-2">Booking Management</h2>
            <span role="img" aria-label="bookings">📝</span>
          </div>
          <p className="text-gray-600 mb-6">Manage all room bookings here.</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Bookings", count: bookings.length },
              { label: "Confirmed", count: bookings.filter(b => b.status === "confirmed").length },
              { label: "Pending", count: bookings.filter(b => b.status === "pending").length },
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
              placeholder="Search by customer name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border rounded w-full md:w-1/3"
            />
            <button
              onClick={() => exportCSV(bookings)}
              className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded shadow hover:bg-indigo-600"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-800"
            >
              + Add Booking
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Customer Name</th>
                  <th className="p-3 text-left">Room ID</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.length === 0 ? (
                  <tr><td className="p-4 text-center" colSpan="5">No bookings found.</td></tr>
                ) : (
                  currentBookings.map((booking) => (
                    <tr key={booking._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{booking.customerName || "Unknown"}</td>
                      <td className="p-3">{booking.roomId || "N/A"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === "confirmed" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-3">{new Date(booking.date).toLocaleString()}</td>
                      <td className="p-3 relative" ref={dropdownRef}>
                        <button
                          onClick={() => setShowDropdown(showDropdown === booking._id ? null : booking._id)}
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {showDropdown === booking._id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                            <div
                              onClick={() => exportCSV([booking])}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              Export CSV
                            </div>
                            <div
                              onClick={() => deleteBooking(booking._id)}
                              className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                            >
                              Delete Booking
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

          {/* Add Booking Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content relative">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="modal-close"
                >
                  ✖
                </button>
                <h3 className="modal-title mb-4">Add New Booking</h3>
                <form onSubmit={handleAddBooking} className="space-y-3">
                  <input name="customerName" placeholder="Customer Name" required className="modal-input" />
                  <input name="roomId" placeholder="Room ID" required className="modal-input" />
                  <input name="date" placeholder="Date & Time" type="datetime-local" required className="modal-input" />
                  <select name="status" required className="modal-input">
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                  <button type="submit" className="modal-submit">
                    Add Booking
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

export default BookingManagement;