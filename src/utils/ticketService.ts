import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AES, enc } from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_TICKET_SECRET_KEY || 'default-secret-key';

export const generatePDF = async (element: HTMLElement): Promise<Blob> => {
  if (!element) {
    throw new Error('No element provided for PDF generation');
  }

  try {
    // Ensure all images are loaded
    await Promise.all(
      Array.from(element.getElementsByTagName('img')).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // Set a timeout to avoid hanging
          setTimeout(reject, 5000);
        });
      })
    );

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.transform = 'none';

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight
    });

    document.body.removeChild(clone);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = (pdfHeight - imgHeight * ratio) / 2;

    pdf.addImage(
      canvas.toDataURL('image/png', 1.0),
      'PNG',
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio,
      undefined,
      'FAST'
    );

    return pdf.output('blob');
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate ticket PDF');
  }
};

export const generateQRData = (bookingId: string, ticketType: string): string => {
  const timestamp = Math.floor(Date.now() / 60000);
  const data = {
    bookingId,
    ticketType,
    timestamp,
    validationCode: AES.encrypt(`${bookingId}-${timestamp}`, SECRET_KEY).toString().substring(0, 16)
  };
  return AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const validateTicket = (encryptedData: string): boolean => {
  try {
    const decrypted = AES.decrypt(encryptedData, SECRET_KEY).toString(enc.Utf8);
    const data = JSON.parse(decrypted);
    const currentTimestamp = Math.floor(Date.now() / 60000);
    return currentTimestamp === data.timestamp;
  } catch {
    return false;
  }
};