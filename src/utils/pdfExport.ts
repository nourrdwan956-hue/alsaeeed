import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margin?: number; // margin in mm
  pixelRatio?: number;
  scale?: number; // alias for pixelRatio
  quality?: number;
  fitToOnePage?: boolean; // When true, scales the document to fit cleanly on exactly 1 single page
}

/**
 * Robust Client-Side PDF Generator & Exporter
 * Formats directly to standard A4 (210 x 297 mm) on exactly ONE single page by default,
 * with full unconstrained DOM cloning, Arabic RTL font rendering, and high-DPI quality.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  let stage: HTMLDivElement | null = null;
  try {
    const {
      filename = 'document.pdf',
      orientation = 'portrait',
      format = 'a4',
      margin = 6,
      pixelRatio = options.scale || 2.5,
      quality = 0.96,
      fitToOnePage = true
    } = options;

    // 1. Create an off-screen staging area to render the entire unconstrained document
    stage = document.createElement('div');
    stage.style.position = 'fixed';
    stage.style.left = '-9999px';
    stage.style.top = '0';
    stage.style.width = '780px'; // optimal A4 proportion width
    stage.style.height = 'auto';
    stage.style.maxHeight = 'none';
    stage.style.overflow = 'visible';
    stage.style.backgroundColor = '#ffffff';
    stage.style.zIndex = '-9999';
    stage.style.boxSizing = 'border-box';
    stage.setAttribute('dir', 'rtl');

    // 2. Clone the element and make all subcontainers unconstrained
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.margin = '0';
    clone.style.padding = '24px';
    clone.style.backgroundColor = '#ffffff';

    // Unset scroll and max-height limits on any nested containers inside clone
    const allDescendants = clone.querySelectorAll<HTMLElement>('*');
    allDescendants.forEach((node) => {
      node.style.maxHeight = 'none';
      if (node.style.overflow === 'auto' || node.style.overflow === 'scroll' || node.style.overflow === 'hidden') {
        node.style.overflow = 'visible';
      }
      if (
        node.classList.contains('print:hidden') ||
        node.classList.contains('no-print') ||
        node.getAttribute('data-pdf-hide') === 'true'
      ) {
        node.style.display = 'none';
      }
    });

    stage.appendChild(clone);
    document.body.appendChild(stage);

    // Give DOM a micro-tick to calculate full unconstrained geometry
    await new Promise((resolve) => setTimeout(resolve, 60));

    // 3. Render full unconstrained clone to high-res canvas
    const canvas = await toCanvas(clone, {
      pixelRatio: pixelRatio,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
      width: 780,
      filter: (node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains('print:hidden') ||
            node.classList.contains('no-print') ||
            node.getAttribute('data-pdf-hide') === 'true'
          ) {
            return false;
          }
        }
        return true;
      }
    });

    // 4. Initialize jsPDF instance (Standard A4: 210 x 297 mm)
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format,
      compress: true
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth();   // 210 mm for A4
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297 mm for A4

    const usableWidth = pdfPageWidth - margin * 2;
    const usableHeight = pdfPageHeight - margin * 2;

    const canvasAspect = canvas.height / canvas.width;
    const fullRenderedHeightMm = usableWidth * canvasAspect;

    // 5. Fit to Single Page Mode (guarantees exactly 1 page output)
    if (fitToOnePage || fullRenderedHeightMm <= usableHeight * 1.15) {
      let finalWidthMm = usableWidth;
      let finalHeightMm = fullRenderedHeightMm;

      // If taller than usable page height, scale down to fit within 1 single A4 page
      if (finalHeightMm > usableHeight) {
        const scaleFactor = usableHeight / finalHeightMm;
        finalWidthMm = usableWidth * scaleFactor;
        finalHeightMm = usableHeight;
      }

      // Center horizontally on page
      const xOffset = margin + (usableWidth - finalWidthMm) / 2;
      const yOffset = margin;

      const imgData = canvas.toDataURL('image/jpeg', quality);
      pdf.addImage(
        imgData,
        'JPEG',
        xOffset,
        yOffset,
        finalWidthMm,
        finalHeightMm,
        undefined,
        'FAST'
      );
    } else {
      // Multi-page slicing if explicitly requested
      const pxPerMm = canvas.width / usableWidth;
      const maxSliceHeightPx = Math.floor(usableHeight * pxPerMm);
      const totalHeightPx = canvas.height;

      let currentY = 0;
      let pageNumber = 0;

      while (currentY < totalHeightPx) {
        const currentSliceHeightPx = Math.min(maxSliceHeightPx, totalHeightPx - currentY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeightPx;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            currentY,
            canvas.width,
            currentSliceHeightPx,
            0,
            0,
            pageCanvas.width,
            currentSliceHeightPx
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
        const sliceHeightMm = currentSliceHeightPx / pxPerMm;

        if (pageNumber > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          pageImgData,
          'JPEG',
          margin,
          margin,
          usableWidth,
          sliceHeightMm,
          undefined,
          'FAST'
        );

        currentY += currentSliceHeightPx;
        pageNumber++;
      }
    }

    // 6. Direct browser file download
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Error exporting complete PDF:', error);
    window.print();
    return false;
  } finally {
    if (stage && stage.parentNode) {
      stage.parentNode.removeChild(stage);
    }
  }
}
