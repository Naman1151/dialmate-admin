// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";
import TableSection from "../components/TableSection";
import { ToastContainer, toast } from "react-toastify";
import { PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";

function Dashboard() {
  const [data, setData] = useState({ users: [], bookings: [], calls: [] });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeBookingTab, setActiveBookingTab] = useState("all");
  const [search, setSearch] = useState({ rooms: "", staff: "", bookings: "" });
  const [currentPage, setCurrentPage] = useState({
    rooms: 1,
    staff: 1,
    bookings: 1,
  });
  const pageSize = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, bookingsRes, callsRes] = await Promise.all([
        API.get("/users"),
        API.get("/bookings"),
        API.get("/calls"),
      ]);
      setData({
        users: usersRes.data.data || usersRes.data,
        bookings: bookingsRes.data.data || bookingsRes.data,
        calls: callsRes.data.data || callsRes.data,
      });
    } catch (error) {
      toast.error("Error fetching dashboard data");
    }
    setLoading(false);
  };

  const exportCSV = (dataToExport, filename) => {
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported successfully!");
  };

  const callsArray = Array.isArray(data.calls)
    ? data.calls
    : Object.values(data.calls);
  const usersArray = Array.isArray(data.users)
    ? data.users
    : Object.values(data.users);
  const bookingsArray = Array.isArray(data.bookings)
    ? data.bookings
    : Object.values(data.bookings);

  const totalCheckinCustomers = usersArray.length;
  const totalEmployees = usersArray.filter((user) =>
    ["Staff", "Manager", "Admin"].includes(user.role)
  ).length;
  const totalCalls = callsArray.length;
  const totalBookings = bookingsArray.length;

  const callsByMonth = Array.from({ length: 12 }, (_, monthIndex) => {
    const month = monthIndex + 1;
    const monthCalls = callsArray.filter((call) => {
      const callDate = new Date(call.createdAt);
      return (
        callDate.getFullYear() === parseInt(selectedYear) &&
        callDate.getMonth() + 1 === month
      );
    });
    return {
      month: new Date(0, monthIndex).toLocaleString("default", {
        month: "short",
      }),
      calls: monthCalls.length,
    };
  });

  const filteredRooms = bookingsArray.filter((booking) =>
    booking.roomNumber
      ?.toLowerCase()
      .includes(search.rooms.toLowerCase())
  );
  const paginatedRooms = filteredRooms.slice(
    (currentPage.rooms - 1) * pageSize,
    currentPage.rooms * pageSize
  );

  const staffList = usersArray.filter((user) =>
    ["Staff", "Manager"].includes(user.role)
  );
  const filteredStaff = staffList.filter((staff) =>
    staff.name?.toLowerCase().includes(search.staff.toLowerCase())
  );
  const paginatedStaff = filteredStaff.slice(
    (currentPage.staff - 1) * pageSize,
    currentPage.staff * pageSize
  );

  const activeBookings = bookingsArray.filter(
    (booking) => booking.status?.toLowerCase() === "active"
  );
  const bookingsToShow =
    activeBookingTab === "active" ? activeBookings : bookingsArray;
  const filteredBookings = bookingsToShow.filter(
    (booking) =>
      booking.roomNumber
        ?.toLowerCase()
        .includes(search.bookings.toLowerCase()) ||
      booking.bookingType
        ?.toLowerCase()
        .includes(search.bookings.toLowerCase())
  );
  const paginatedBookings = filteredBookings.slice(
    (currentPage.bookings - 1) * pageSize,
    currentPage.bookings * pageSize
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#f9f5f1] p-6 relative"
    >
      <ToastContainer />

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Floating Dialer CTA */}
          <button
            onClick={() => window.open("tel:YOUR_NUMBER")}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-[#b56a36] to-[#e6a258] text-white p-4 rounded-full shadow-lg hover:scale-105 transition transform"
          >
            <PhoneCall className="w-6 h-6" />
          </button>

          {/* Greeting */}
          <motion.h1
            className="text-3xl font-bold mb-8 text-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome to Dialmate Admin Panel 🎉
          </motion.h1>

          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {[
              { title: "Total Check-in Customers", value: totalCheckinCustomers },
              { title: "Total Employees", value: totalEmployees },
              { title: "Total Calls Made", value: totalCalls },
              { title: "Total Bookings", value: totalBookings },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="text-4xl font-bold text-[#b56a36] mb-2">
                  {item.value}
                </div>
                <div className="text-gray-700 text-sm font-medium">
                  {item.title}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Calls Chart */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Calls Overview - {selectedYear}
              </h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={callsByMonth} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="calls" fill="#b56a36" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tables Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <TableSection
              title="Checked-in Rooms"
              data={paginatedRooms}
              searchValue={search.rooms}
              setSearchValue={(value) =>
                setSearch((prev) => ({ ...prev, rooms: value }))
              }
              exportData={filteredRooms}
              columns={[
                { header: "Room Number", accessor: "roomNumber" },
                { header: "Check-in Date", accessor: "checkInDate" },
                { header: "Call", accessor: "callButton" },
              ]}
              page={currentPage.rooms}
              setPage={(page) =>
                setCurrentPage((prev) => ({ ...prev, rooms: page }))
              }
              pageSize={pageSize}
              totalRecords={filteredRooms.length}
            />

            <TableSection
              title="Staff Members"
              data={paginatedStaff}
              searchValue={search.staff}
              setSearchValue={(value) =>
                setSearch((prev) => ({ ...prev, staff: value }))
              }
              exportData={filteredStaff}
              columns={[
                { header: "Staff ID", accessor: "staffId" },
                { header: "Staff Call Number", accessor: "phone" },
                { header: "Department", accessor: "department" },
                { header: "Call", accessor: "callButton" },
              ]}
              page={currentPage.staff}
              setPage={(page) =>
                setCurrentPage((prev) => ({ ...prev, staff: page }))
              }
              pageSize={pageSize}
              totalRecords={filteredStaff.length}
            />
          </motion.div>

          {/* Bookings Table with Tabs */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Bookings</h2>
              <div className="flex space-x-2">
                {["all", "active"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBookingTab(tab)}
                    className={`px-4 py-2 rounded ${
                      activeBookingTab === tab
                        ? "bg-gradient-to-r from-[#b56a36] to-[#e6a258] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tab === "all" ? "All Bookings" : "Active Bookings"}
                  </button>
                ))}
              </div>
            </div>

            <TableSection
              title=""
              data={paginatedBookings}
              searchValue={search.bookings}
              setSearchValue={(value) =>
                setSearch((prev) => ({ ...prev, bookings: value }))
              }
              exportData={filteredBookings}
              columns={[
                { header: "Room Number", accessor: "roomNumber" },
                { header: "Booking Date", accessor: "bookingDate" },
                { header: "Booking Time", accessor: "bookingTime" },
                { header: "Booking Type", accessor: "bookingType" },
                { header: "Booking Status", accessor: "bookingStatus" },
                { header: "Call", accessor: "callButton" },
              ]}
              page={currentPage.bookings}
              setPage={(page) =>
                setCurrentPage((prev) => ({ ...prev, bookings: page }))
              }
              pageSize={pageSize}
              totalRecords={filteredBookings.length}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default Dashboard;