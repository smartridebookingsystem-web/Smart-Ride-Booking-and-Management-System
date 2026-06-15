import React, { useMemo, useState } from "react";

export default function CustomTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
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

  return (
    <div className="card shadow-sm">
      {/* Header */}
      <div className="card-header">
        <div className="row align-items-center">
          <div className="col-md-6 d-flex align-items-center">
            <span>Show</span>

            <select
              className="form-select mx-2"
              style={{ width: "100px" }}
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

            <span>entries</span>
          </div>

          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
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

                  <td>
                    {onView && (
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => onView(row)}
                      >
                        <i className="fa fa-eye"></i>
                      </button>
                    )}

                    {onEdit && (
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => onEdit(row)}
                      >
                        <i className="fa fa-pencil"></i>
                      </button>
                    )}

                    {onDelete && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(row)}
                      >
                        <i className="fa fa-trash"></i>
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
          <div className="col-md-6">
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
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
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
                className={`page-item ${
                  currentPage === totalPages || totalPages === 0
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
