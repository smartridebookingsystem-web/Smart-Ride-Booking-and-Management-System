import React, { useEffect, useState } from "react";

export default function LicensePreviewModal({ previewDoc, setPreviewDoc }) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!previewDoc?.url) {
      setBlobUrl(null);
      return;
    }

    const rawUrl = previewDoc.url;
    if (typeof rawUrl === "string" && rawUrl.startsWith("data:application/pdf")) {
      try {
        const parts = rawUrl.split(",");
        const base64Data = parts[1] || parts[0];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);

        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      } catch (e) {
        console.error("Failed to convert PDF base64 to blob:", e);
        setBlobUrl(rawUrl);
      }
    } else {
      setBlobUrl(rawUrl);
    }
  }, [previewDoc]);

  if (!previewDoc) return null;

  const displayUrl = blobUrl || previewDoc.url;
  const isPdf =
    previewDoc.isPdf ||
    (typeof previewDoc.url === "string" &&
      (previewDoc.url.startsWith("data:application/pdf") || previewDoc.url.toLowerCase().includes(".pdf")));

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
              <i className="bi bi-file-earmark-pdf-fill me-2" style={{ color: "#FF6B00" }}></i>
              {previewDoc.title}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewDoc(null)}></button>
          </div>
          <div className="modal-body p-3 text-center bg-white" style={{ minHeight: "480px" }}>
            {isPdf ? (
              <object data={displayUrl} type="application/pdf" width="100%" height="480px">
                <embed src={displayUrl} type="application/pdf" width="100%" height="480px" />
                <p className="p-3 text-muted">
                  Your browser preview is unavailable.{" "}
                  <a href={displayUrl} download="Driver_License.pdf" target="_blank" rel="noreferrer" className="fw-bold text-warning">
                    Click here to download &amp; view PDF
                  </a>
                </p>
              </object>
            ) : (
              <img src={displayUrl} alt="License Document" className="img-fluid rounded-3" style={{ maxHeight: "480px" }} />
            )}
          </div>
          <div className="modal-footer bg-light">
            <a
              href={displayUrl}
              download="Driver_License_Document.pdf"
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
