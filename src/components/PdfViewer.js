import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

export default function App() {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageScale, setPageScale] = useState(1);
  const [pagePreviews, setPagePreviews] = useState([]);

  const url =
    "https://backend.simplestudying.com/media/pdfs/6578yigufhugyf2da.pdf";

  useEffect(() => {
    fetchPagePreviews();
  }, [totalPages]);

  function onDocumentLoadSuccess({ numPages }) {
    setTotalPages(numPages);
  }

  function handleThumbnailClick(pageIndex) {
    setPageNumber(pageIndex + 1);
  }

  async function fetchPagePreviews() {
    const previews = [];
    for (let i = 0; i < totalPages; i++) {
      const previewUrl = `${url}#page=${i + 1}`;
      previews.push(previewUrl);
    }
    setPagePreviews(previews);
  }

  return (
    <div className="mainDiv">
      <div className="left-side">
        <div className="leftSideHeader">
          <h3>Table of Contents</h3>
        </div>
        <div className="leftSideContent">
          {pagePreviews.map((previewUrl, index) => (
            <div
              key={index}
              className="boxOne"
              onClick={() => handleThumbnailClick(index)}
            >
              <img src={previewUrl} alt={`Page ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="right-side">
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} scale={pageScale} />
        </Document>
      </div>
    </div>
  );
}
