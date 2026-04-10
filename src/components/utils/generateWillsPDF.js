import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a high-quality PDF from a DOM element.
 * @param {string} elementId - The ID of the element to capture.
 * @param {string} fileName - The name of the resulting PDF file.
 */
export const generateWillsPDF = async (containerId, fileName = "Last_Will_and_Testament.pdf") => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found.`);
    return;
  }

  const pages = container.querySelectorAll(".pdf-page");
  if (pages.length === 0) {
    return generateSinglePagePDF(container, fileName);
  }

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    for (let i = 0; i < pages.length; i++) {
      const pageElement = pages[i];
      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: pageElement.scrollWidth,
      });

      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImageWidth = pageWidth;
      const pdfImageHeight = (imgProps.height * pdfImageWidth) / imgProps.width;

      if (i > 0) pdf.addPage();
      
      // TOLERANCE (5mm): If the content is slightly taller than A4, don't split it.
      // This prevents "one-line" overflows.
      let heightLeft = pdfImageHeight;
      let position = 0;
      const tolerance = 5; 
      
      pdf.addImage(imgData, "PNG", 0, position, pdfImageWidth, pdfImageHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > tolerance) {
        position = heightLeft - pdfImageHeight;
        pdf.addPage();
        pdf.setPage(pdf.getNumberOfPages());
        pdf.addImage(imgData, "PNG", 0, position, pdfImageWidth, pdfImageHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("Critical error during PDF generation:", error);
    return false;
  }
};

const generateSinglePagePDF = async (element, fileName) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    // ... same offset logic as original script ...
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageImageHeight = (canvas.height * pageWidth) / canvas.width;
    let heightLeft = pageImageHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, pageImageHeight, undefined, 'FAST');
    heightLeft -= pdf.internal.pageSize.getHeight();
    while (heightLeft > 0) {
      position = heightLeft - pageImageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, pageImageHeight, undefined, 'FAST');
      heightLeft -= pdf.internal.pageSize.getHeight();
    }
    pdf.save(fileName);
    return true;
  } catch (e) { return false; }
};
