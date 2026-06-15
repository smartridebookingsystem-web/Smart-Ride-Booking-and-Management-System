import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RowDetailsModal = ({
  row,
  mode = "view",
  title = "Row Details",
  onSave,
  onClose,
}) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(row || {});

  useEffect(() => {
    if (row) {
      setFormData(row);
      setShow(true);
    }
  }, [row]);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    const tableData = Object.entries(formData).map(([key, value]) => [
      key,
      value,
    ]);

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 12, cellPadding: 4 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("row-details.pdf");
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(formData);
    handleClose();
  };

  if (!row || !show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title text-center">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            {mode === "edit" ? (
              Object.entries(formData).map(([key, value]) => (
                <div className="mb-3 row" key={key}>
                  <label className="col-sm-4 col-form-label fw-bold">
                    {key}
                  </label>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      className="form-control"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="table-responsive">
                <table className="table mb-0 border-0">
                  <tbody>
                    {Object.entries(formData).map(([key, value]) => (
                      <tr key={key}>
                        <td className="fw-bold" style={{ border: "none" }}>
                          {key}
                        </td>
                        <td style={{ border: "none" }}>:</td>
                        <td style={{ border: "none" }}> {value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>
              Close
            </button>
            {mode === "edit" ? (
              <button className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            ) : (
              <button className="btn btn-success" onClick={handlePrint}>
                Print / Save PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RowDetailsModal;
