// src/components/TableSection.jsx
import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-toastify";

function TableSection({
  title,
  data,
  searchValue,
  setSearchValue,
  exportData,
  columns,
  page,
  setPage,
  pageSize,
  totalRecords,
}) {
  const [isTableLoading, setIsTableLoading] = useState(true);

  useEffect(() => {
    // Simulate shimmer loading delay
    setIsTableLoading(true);
    const timer = setTimeout(() => setIsTableLoading(false), 600);
    return () => clearTimeout(timer);
  }, [data]);

  const exportCSV = () => {
    if (!exportData.length) {
      toast.error("No data to export");
      return;
    }
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${title || "data"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported successfully 🎉");
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 transition-all duration-500 ease-in-out">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button
            onClick={exportCSV}
            className="flex items-center text-sm bg-gradient-to-r from-[#b56a36] to-[#e6a258] text-white px-3 py-1 rounded shadow hover:opacity-90 transition"
          >
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        {isTableLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-2 px-2 text-gray-600">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="border-t text-gray-700 hover:bg-gray-50 transition">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="py-2 px-2">
                        {col.accessor === "callButton" ? (
                          <button className="bg-gradient-to-r from-[#b56a36] to-[#e6a258] text-white px-3 py-1 rounded hover:opacity-90 text-xs shadow">
                            Call
                          </button>
                        ) : (
                          item[col.accessor] ?? "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-4 space-x-2 text-xs">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`px-2 py-1 rounded ${
                page === idx + 1
                  ? "bg-gradient-to-r from-[#b56a36] to-[#e6a258] text-white"
                  : "bg-gray-100 text-gray-700"
              } hover:opacity-90 transition`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TableSection;