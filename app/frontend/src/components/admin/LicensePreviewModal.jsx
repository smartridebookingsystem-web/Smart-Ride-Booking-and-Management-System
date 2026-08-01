import React from "react";

export default function LicensePreviewModal({ previewDoc, setPreviewDoc }) {
  if (!previewDoc) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(15,23,42,0.6)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderLeft: "5px solid #FF6B00",
            }}
          >
            <h5 className="modal-title fw-bold">
              <i className="bi bi-file-earmark-pdf-fill me-2" style={{ color: "#FF6B00" }}></i>{previewDoc.title}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewDoc(null)}></button>
          </div>
          <div className="modal-body p-3 text-center bg-white" style={{ minHeight: "450px" }}>
            {previewDoc.isPdf ? (
              <iframe src={previewDoc.url} title="License PDF" width="100%" height="450px" style={{ border: "none" }} />
            ) : (
              <img src={previewDoc.url} alt="License Document" className="img-fluid rounded-3" style={{ maxHeight: "450px" }} />
            )}
          </div>
          <div className="modal-footer bg-light">
            <a
              href={previewDoc.url}
              download="License_Document"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-warning fw-semibold"
              style={{ color: "#FF6B00", borderColor: "#FF6B00" }}
            >
              <i className="bi bi-download me-1"></i> Download File
            </a>
            <button className="btn btn-secondary rounded-3" onClick={() => setPreviewDoc(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
