import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CustomTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  tableName = "SmartRide Data Report",
}) {
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleColumnFilter = (field, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const globalMatch = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const columnMatch = columns.every((col) => {
        const filterValue = columnFilters[col.field]?.toLowerCase() || "";

        if (!filterValue) return true;

        return String(row[col.field] || "")
          .toLowerCase()
          .includes(filterValue);
      });

      return globalMatch && columnMatch;
    });
  }, [data, search, columnFilters, columns]);

  const sortedData = useMemo(() => {
    const sortable = [...filteredData];

    if (sortField) {
      sortable.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;

        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;

        return 0;
      });
    }

    return sortable;
  }, [filteredData, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / entries);

  const currentData = sortedData.slice(
    (currentPage - 1) * entries,
    currentPage * entries,
  );

  /* ---------------- PDF Export Utility Functions ---------------- */

  const generatePdfReport = (exportRows, title) => {
    if (!exportRows || exportRows.length === 0) {
      alert("No data available to export.");
      return;
    }

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(title, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Total Records: ${exportRows.length}`, 14, 22);

    const tableHeaders = columns.map((col) => col.header);
    const tableBody = exportRows.map((row, idx) =>
      columns.map((col) => {
        const val = row[col.field];
        if (typeof val === "object" && val !== null && val.props) {
          // Flatten JSX or badge elements to plain text if needed
          return String(row.status || row[col.field] || "");
        }
        return val !== undefined && val !== null ? String(val) : "";
      })
    );

    autoTable(doc, {
      head: [["#", ...tableHeaders]],
      body: tableBody.map((r, i) => [i + 1, ...r]),
      startY: 28,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`);
  };

  const handleDownloadCurrentFilteredData = () => {
    if (sortedData.length === 0) {
      alert("No matching records found to download.");
      return;
    }

    const userInput = prompt(
      `How many records would you like to download? (Matching results: ${sortedData.length})`,
      String(sortedData.length)
    );

    if (userInput === null) return; // User cancelled

    const count = parseInt(userInput, 10);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid positive number of records.");
      return;
    }

    const recordsToExport = sortedData.slice(0, count);
    generatePdfReport(recordsToExport, `${tableName} - Filtered View (${recordsToExport.length} Records)`);
  };

  const handleDownloadWholeData = () => {
    if (data.length === 0) {
      alert("No table data available to download.");
      return;
    }
    generatePdfReport(data, `${tableName} - Complete Dataset (${data.length} Records)`);
  };

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header bg-white py-3">
        <div className="row align-items-center g-3">
          <div className="col-md-4 d-flex align-items-center">
            <span className="me-2 text-secondary fw-semibold">Show</span>
            <select
              className="form-select border-primary"
              style={{ width: "90px" }}
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ms-2 text-secondary fw-semibold">entries</span>
          </div>

          <div className="col-md-8 d-flex flex-wrap justify-content-md-end gap-2 align-items-center">
            {/* Download Filtered PDF Button */}
            <button
              className="btn btn-outline-success btn-sm px-3 fw-bold"
              onClick={handleDownloadCurrentFilteredData}
              title="Download filtered/searched records as PDF"
            >
              <i className="bi bi-funnel-fill me-1"></i> Download Filtered PDF
            </button>

            {/* Download Whole Data PDF Button */}
            <button
              className="btn btn-primary btn-sm px-3 fw-bold"
              onClick={handleDownloadWholeData}
              title="Download entire dataset as PDF"
            >
              <i className="bi bi-file-earmark-pdf-fill me-1"></i> Download Whole Data PDF
            </button>

            {/* Search Input */}
            <div style={{ minWidth: "200px" }}>
              <input
                type="text"
                className="form-control form-control-sm border-primary"
                placeholder="Global Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered mb-0">
          <thead className="table-primary">
            {/* Header Row */}
            <tr>
              <th style={{ width: "80px" }}>#</th>

              {columns.map((col) => (
                <th key={col.field}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{col.header}</span>

                    <span>
                      <i
                        className="fa fa-arrow-up me-2 opacity-50"
                        style={{
                          cursor: "pointer",
                          color:
                            sortField === col.field && sortOrder === "asc"
                              ? "blue"
                              : "",
                        }}
                        onClick={() => {
                          setSortField(col.field);
                          setSortOrder("asc");
                        }}
                      />

                      <i
                        className="fa fa-arrow-down"
                        style={{
                          cursor: "pointer",
                          color:
                            sortField === col.field && sortOrder === "desc"
                              ? "blue"
                              : "",
                        }}
                        onClick={() => {
                          setSortField(col.field);
                          setSortOrder("desc");
                        }}
                      />
                    </span>
                  </div>
                </th>
              ))}

              <th style={{ width: "180px" }}>Actions</th>
            </tr>

            {/* Column Search Row */}
            <tr>
              <th></th>

              {columns.map((col) => (
                <th key={`search-${col.field}`}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={`Search ${col.header}`}
                    value={columnFilters[col.field] || ""}
                    onChange={(e) =>
                      handleColumnFilter(col.field, e.target.value)
                    }
                  />
                </th>
              ))}

              <th></th>
            </tr>
          </thead>

          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr key={row.id || index}>
                  <td>{(currentPage - 1) * entries + index + 1}</td>

                  {columns.map((col) => (
                    <td key={col.field}>{row[col.field]}</td>
                  ))}

                  <td className="text-nowrap">
                    {onView && (
                      <button
                        className="btn btn-outline-primary btn-sm px-2 py-1 me-1 shadow-sm"
                        title="View Document & Details"
                        onClick={() => onView(row)}
                      >
                        <i className="bi bi-eye-fill fs-6"></i>
                      </button>
                    )}

                    {onEdit && (
                      <button
                        className="btn btn-outline-warning text-dark btn-sm px-2 py-1 me-1 shadow-sm"
                        title="Edit Verification Status"
                        onClick={() => onEdit(row)}
                      >
                        <i className="bi bi-pencil-square fs-6"></i>
                      </button>
                    )}

                    {onDelete && (
                      <button
                        className="btn btn-outline-danger btn-sm px-2 py-1 shadow-sm"
                        title="Delete Driver Record from Database"
                        onClick={() => onDelete(row)}
                      >
                        <i className="bi bi-trash-fill fs-6"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="text-center">
                  No Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div className="row align-items-center">
          <div className="col-md-6 text-light">
            Showing {currentData.length ? (currentPage - 1) * entries + 1 : 0}{" "}
            to {Math.min(currentPage * entries, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>

          <div className="col-md-6">
            <ul className="pagination justify-content-end mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${currentPage === index + 1 ? "active" : ""
                    }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${currentPage === totalPages || totalPages === 0
                    ? "disabled"
                    : ""
                  }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
