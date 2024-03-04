import React, { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Loader from "./Loader";
import { BsZoomOut, BsZoomIn } from "react-icons/bs";
import { RiFullscreenFill } from "react-icons/ri";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const App = () => {
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

  useEffect(() => {
    handleSearch();
  }, [pdfData.searchQuery]);

  const fetchPagePreviews = async () => {
    try {
      const previews = await Promise.all(
        Array.from({ length: pdfData.totalPages }, async (_, i) => {
          const page = await pdfjs
            .getDocument(url)
            .promise.then((doc) => doc.getPage(i + 1));
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
          page.cleanup();
          return canvas.toDataURL("image/png");
        })
      );
      setPdfData((prevData) => ({
        ...prevData,
        pagePreviews: previews,
      }));
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

  const handleSearch = async () => {
    const { searchQuery, totalPages } = pdfData;
    if (!searchQuery || !totalPages) return;
    const highlights = [];

    try {
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfjs
          .getDocument(url)
          .promise.then((doc) => doc.getPage(i));
        const textContent = await page.getTextContent();

        for (let j = 0; j < textContent.items.length; j++) {
          const textItem = textContent.items[j];
          if (textItem.str.toLowerCase().includes(searchQuery.toLowerCase())) {
            highlights.push({ pageIndex: i, textItem });
          }
        }
      }

      console.log(highlights, "mmmmmm");
      setPdfData((prevData) => ({
        ...prevData,
        highlightedText: highlights,
      }));
    } catch (error) {
      console.error("Error searching text:", error);
    }
  };

  useEffect(() => {
    console.log(pdfData.highlightedText, "oooooooo");
  }, [pdfData.highlightedText]);

  console.log(pdfData.highlightedText, "hieghlight");

  const { pageNumber, pagePreviews, pageScale, loading, highlightedText } =
    pdfData;

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
          <input
            type={"text"}
            onChange={(e) => {
              setTimeout(() => {
                setPdfData((prevData) => ({
                  ...prevData,
                  searchQuery: e.target.value,
                }));
              }, 500);
            }}
            className="inputField"
            placeholder="Search"
          />
          <button
            className="button-back"
            onClick={() => handleZoom("out")}
            disabled={pageScale <= 0.3}
          >
            <BsZoomOut
              style={{
                height: "20px",
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
                height: "20px",
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
                height: "20px",
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
          <Page
            pageNumber={pageNumber}
            scale={pageScale}
            customTextRenderer={(textItem, pageIndex) => {
              const isHighlighted = highlightedText.some(
                (highlight) =>
                  highlight.pageIndex === pageIndex + 1 &&
                  highlight.textItem.str === textItem.str
              );

              return (
                <span
                  key={`text_${pageIndex}_${textItem.str}`}
                  style={{
                    backgroundColor: isHighlighted ? "yellow" : "transparent",
                  }}
                >
                  {textItem.str}
                </span>
              );
            }}
          />
        </Document>
      </div>
    </div>
  );
};

export default App;
