import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

export default function App() {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pagePreviews, setPagePreviews] = useState([]);

  const url =
    "https://backend.simplestudying.com/media/pdfs/6578yigufhugyf2da.pdf";

  useEffect(() => {
    fetchPagePreviews();
  }, [totalPages]);

  function onDocumentLoadSuccess({ numPages }) {
    setTotalPages(numPages);
  }

  async function fetchPagePreviews() {
    // debugger;
    if (totalPages > 0) {
      const previews = [];
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfjs
          .getDocument(url)
          .promise.then((doc) => doc.getPage(i));
        const scale = 0.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        const renderTask = page.render(renderContext);
        await renderTask.promise;
        previews.push(canvas.toDataURL("image/png"));
      }
      setPagePreviews(previews);
    }
  }

  function handleThumbnailClick(pageIndex) {
    setPageNumber(pageIndex + 1);
  }

  console.log(pagePreviews, "000");

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
              <img
                src={previewUrl}
                alt={`Page ${index + 1}`}
                style={{ width: "100%" }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="right-side">
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
    </div>
  );
}
