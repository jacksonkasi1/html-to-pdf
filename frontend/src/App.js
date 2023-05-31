import React, { useState } from "react";
import axios from "./axios";
import { html as exportedHtml } from "./exporthtml";
import PdfViewerComponent from "./components/PdfViewerComponent";

import "./styles.css";

const PDFGenerator = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPdf, setShowPdf] = useState(false);

  const generatePDF = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "/generate-pdf",
        {
          html: htmlContent,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob", // Set the response type to blob
        }
      );

      console.log(response.data);

      if (response.data.error) {
        alert(response.data.error);
      }

      const url = URL.createObjectURL(response.data); // Use response.data directly
      setPdfUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openWindowWithContent = (content) => {
    const windowReference = window.open();
    windowReference.document.write(content);
    windowReference.document.close();
  };

  const viewHTML = () => {
    openWindowWithContent(htmlContent);
  };

  const viewPDF = () => {
    window.open(pdfUrl);
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "generated-pdf.pdf";
    link.click();
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const base64toPdf = async () => {
    try {
      const res = await fetch(pdfUrl);
      const pdfData = await res.blob();
      const formData = await blobToBase64(pdfData);

      console.log(formData);

      const response = await axios.post(
        "/convert-base64-to-pdf",
        {
          data: formData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      if (response.data.error) {
        alert(response.data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const copyPdfBase64 = async () => {
    const res = await fetch(pdfUrl);
    const pdfData = await res.blob();
    const formData = await blobToBase64(pdfData);

    navigator.clipboard.writeText(formData);

    alert("Copied to clipboard 🙌");
  };

  // sendMail api call body base64 code of pdf
  const sendMail = async () => {
    const res = await fetch(pdfUrl);
    const pdfData = await res.blob();
    const formData = await blobToBase64(pdfData);

    try {
      const response = await axios.post(
        "/send-email",
        {
          data: formData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      if (response.data.error) {
        alert(response.data.error);
      }
      console.log("success fully send email");
    } catch (error) {
      console.log("Email Send error: ", { error });
    }
  };

  const directDownloadPdf = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "/generate-pdf",
        {
          html: htmlContent,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer", // Set the response type to arraybuffer
        }
      );

      console.log(response.data);

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      // Create a Blob from the arraybuffer data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element and set its attributes
      const link = document.createElement("a");
      link.href = url;
      link.download = "your-filename.pdf"; // Set the desired filename for the downloaded PDF

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up the temporary URL and link
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderButtons = () => {
    return (
      <>
        <button className="action-button" onClick={viewHTML}>
          View HTML
        </button>
        <button className="action-button" onClick={viewPDF}>
          View PDF
        </button>
        <button className="action-button" onClick={downloadPDF}>
          Download PDF
        </button>
        <button className="action-button" onClick={directDownloadPdf}>
          Direct Download PDF
        </button>
        <button className="action-button" onClick={base64toPdf}>
          Convert Base 64 to PDF
        </button>
        <button className="action-button" onClick={copyPdfBase64}>
          Copy PDF Base64
        </button>
        <button className="action-button" onClick={() => setShowPdf(true)}>
          Show Pdf View
        </button>
        <button className="action-button" onClick={sendMail}>
          Send Email
        </button>
      </>
    );
  };

  const insertHtmlContent = () => {
    setHtmlContent(exportedHtml);
  };

  return (
    <div className="pdf-generator">
      <h1>PDF Content</h1>
      <textarea
        className="html-input"
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        placeholder="Enter HTML content..."
      />

      <button className="action-button" onClick={insertHtmlContent}>
        Insert Sample HTML
      </button>
      <br />

      <button className="generate-button" onClick={generatePDF}>
        {loading ? "Generating..." : "Generate PDF"}
      </button>
      <br />

      {pdfUrl && <div className="buttons-container">{renderButtons()}</div>}
      <br />

      {/* created by html-pdf-node & pdf-lib */}
      <div className="pdf-container">
        <div
          className="pdf-viewer"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      <br />

      {showPdf && <PdfViewerComponent pdfUrl={pdfUrl} />}

      <br />

      <p className="attribution footer_text">Created by Jackson Kasi 😎</p>

      <p className="attribution">Thanks to html-pdf-node 💖</p>

      <p>
        Note: include <b>-webkit-print-color-adjust: exact;</b> in style tag for
        get exact color from html to pdf
      </p>

      <pre>
        <code>
          {`
    <style>
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
    </style>
      `}
        </code>
      </pre>

      <a href="https://github.com/mrafiqk/html-pdf-node/issues/102">
        issue: #102{" "}
      </a>

      <br />
      <br />
    </div>
  );
};

export default PDFGenerator;
