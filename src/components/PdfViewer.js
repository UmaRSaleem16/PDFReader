import React, { useState, useEffect, useRef } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

function PDFViewer() {
  const [pdfURL, setPdfURL] = useState(null);
  const pdfLink =
    "https://backend.simplestudying.com/media/pdfs/6578yigufhugyf2da.pdf";
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPDF() {
      try {
        const response = await fetch(pdfLink);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfURL(url);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    }

    fetchPDF();

    return () => {
      URL.revokeObjectURL(pdfURL);
    };
  }, [pdfLink]);

  return (
    <div className="mainDiv">
      <div className="left-side">
        <div className="leftSideHeader">
          <h3> Table of Contents </h3>
        </div>
        <div className="leftSideContent">
          <div className="boxOne">faizan khan</div>
        </div>
      </div>
      <div className="right-side">
        {pdfURL && (
          <DocViewer
            documents={[{ uri: pdfURL }]}
            currentPage={currentPage}
            loading={loading}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setLoading(false);
            }}
            pluginRenderers={DocViewerRenderers}
            config={{ hideFileName: true }}
          />
        )}
      </div>
    </div>
  );
}

export default PDFViewer;
