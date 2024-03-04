import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Loader from "./Loader";
import { BsZoomOut, BsZoomIn } from "react-icons/bs";
import { RiFullscreenFill } from "react-icons/ri";

export default function App() {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const [pdfData, setPdfData] = useState({
    totalPages: 0,
    pageNumber: 1,
    pagePreviews: [],
    pageScale: 1.5,
    loading: true,
    searchQuery: "",
    isFullScreen: false,
    highlightedText: [],
  });

  const url =
    "https://backend.simplestudying.com/media/pdfs/6578yigufhugyf2da.pdf";

  useEffect(() => {
    fetchPagePreviews();
  }, [pdfData.totalPages]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPdfData((prevData) => ({
      ...prevData,
      totalPages: numPages,
    }));
  };

  const handleZoom = (zoomType) => {
    const { pageScale } = pdfData;
    const newScale =
      zoomType === "in"
        ? Math.min(pageScale + 0.2, 3)
        : Math.max(pageScale - 0.2, 0.3);
    setPdfData((prevData) => ({
      ...prevData,
      pageScale: newScale,
    }));
  };

  const fetchPagePreviews = async () => {
    try {
      setPdfData((prevData) => ({
        ...prevData,
        loading: true,
      }));
      const { totalPages } = pdfData;
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
            renderTextLayer: false,
          };
          const renderTask = page.render(renderContext);
          await renderTask.promise;
          previews.push(canvas.toDataURL("image/png"));
          page.cleanup();
        }
        setPdfData((prevData) => ({
          ...prevData,
          pagePreviews: previews,
        }));
      }
    } catch (error) {
      console.error("Error fetching page previews:", error);
    } finally {
      setPdfData((prevData) => ({
        ...prevData,
        loading: false,
      }));
    }
  };

  const handleThumbnailClick = (pageIndex) => {
    setPdfData((prevData) => ({
      ...prevData,
      pageNumber: pageIndex + 1,
    }));
  };

  const handleFullScreen = () => {
    const elem = document.documentElement;
    if (!pdfData.isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setPdfData((prev) => ({
      ...prev,
      isFullScreen: !prev.isFullScreen,
    }));
  };

  const { totalPages, pageNumber, pagePreviews, pageScale, loading } = pdfData;

  return (
    <div className="mainDiv">
      <div className="left-side">
        <div className="leftSideHeader">
          <h3>Table of Contents</h3>
        </div>
        <div className="leftSideContent">
          {loading ? (
            <Loader />
          ) : (
            pagePreviews.map((previewUrl, index) => (
              <div
                key={index}
                className="boxOne"
                onClick={() => handleThumbnailClick(index)}
              >
                {/* <p>Page: {index + 1}</p> */}
                <img
                  src={previewUrl}
                  alt={`Page ${index + 1}`}
                  style={{ width: "100%" }}
                />
              </div>
            ))
          )}
        </div>
      </div>
      <div className="right-side">
        <div className="button-container">
          {/* <input
            type={"text"}
            onChange={(e) => handleSearch(e.target.value)}
            className="inputField"
            placeholder="Search"
          /> */}
          <button
            className="button-back"
            onClick={() => handleZoom("out")}
            disabled={pageScale <= 0.3}
          >
            <BsZoomOut
              style={{
                heigh: "20px",
                width: "20px",
                marginTop: "-4px",
                color: "#fff",
              }}
            />
          </button>
          <button
            className="button-back"
            onClick={() => handleZoom("in")}
            disabled={pageScale >= 3}
          >
            <BsZoomIn
              style={{
                heigh: "20px",
                width: "20px",
                marginTop: "-4px",
                color: "#fff",
              }}
            />
          </button>
          <button onClick={handleFullScreen} className="button-back">
            <RiFullscreenFill
              className="button-icon"
              style={{
                heigh: "20px",
                width: "20px",
                marginTop: "-4px",
                color: "#fff",
              }}
            />
          </button>
        </div>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Loader />}
          
        >
          <Page pageNumber={pageNumber} scale={pageScale} />
        </Document>
      </div>
    </div>
  );
}
