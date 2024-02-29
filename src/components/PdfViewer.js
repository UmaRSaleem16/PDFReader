import React, { useEffect, useState } from "react";
// import { Document, Page } from "react-pdf";

const PdfViewer = () => {
  const [state, setState] = useState({
    pdf: "https://backend.simplestudying.com/media/pdfs/6578yigufhugyf2da.pdf",
    pageNumber: 1,
    numPages: null,
    pdfText: ''
  });

  const extractTextFromPdf = async (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result;
          const textRegex = /\(([^)]+)\)/g;
          let match;
          let textString = '';
  
          while ((match = textRegex.exec(text)) !== null) {
            textString += match[1] + ' ';
          }
  
          resolve(textString);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  };

  const extractText = (content) => {
    let text = '';

    const matches = content.match(/\(([^)]+)\)/g);
    if (matches) {
        text = matches.map(match => match.slice(1, -1)).join(' ');
    }
    console.log(text, "texttt")

    return text;
  }
    

  const loadPdf = async () => {
    try {
      const response = await fetch(state.pdf);
      const blob = await response.blob();
      const text = await extractTextFromPdf(blob);
      console.log(text, ":pppp");
      const textContent = extractText(text)
      console.log(textContent, "content")
      setState((prev) => ({
        ...prev,
        pdfText: text
      }));
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };
  

  useEffect(() => {
    loadPdf()
  }, []);

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
      <pre>{state.pdfText}</pre>

      </div>
    </div>
  );
};

export default PdfViewer;
