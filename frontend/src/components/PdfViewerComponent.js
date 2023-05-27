import { useEffect, useRef, useState } from "react";

export default function PdfViewerComponent({ pdfUrl }) {
  const containerRef = useRef(null);
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    (async () => {
      if (pdfUrl) {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfData(url);
      }
    })();
  }, [pdfUrl]);

  useEffect(() => {
    if (!containerRef || !pdfData) return;

    let PSPDFKit;

    (async function () {
      PSPDFKit = await import("pspdfkit");
      await PSPDFKit.load({
        container: containerRef.current,
        document: pdfData,
        baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
      });
    })();

    return () => PSPDFKit && PSPDFKit.unload(containerRef.current);
  }, [pdfData]);

  return <div id="pspdfkit-container" className="pdf-container" ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
