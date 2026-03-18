import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportToPdf(
  containerRef: React.RefObject<HTMLDivElement>,
  period: string,
): Promise<void> {
  const el = containerRef.current;
  if (!el) return;

  // Bring the container on-screen so the browser paints it (opacity:0/z-index:-1 normally hides it)
  el.style.opacity = '1';
  el.style.zIndex = '9999';

  // Wait for charts (ResizeObserver) to settle at the correct dimensions
  await new Promise((resolve) => setTimeout(resolve, 800));

  const dataUrl = await toPng(el, {
    pixelRatio: 2,
    backgroundColor: '#F9FAFB',
    cacheBust: true,
  });

  // Restore hidden state
  el.style.opacity = '0';
  el.style.zIndex = '-1';

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  const today = new Date().toISOString().slice(0, 10);

  // A4 dimensions in mm
  const pageW = 210;
  const pageH = 297;
  const marginX = 12;
  const contentW = pageW - marginX * 2;

  // Scale image to fit page width
  const imgAspect = img.height / img.width;
  const fullImgH = contentW * imgAspect; // total image height in mm

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // No jsPDF text header — header is rendered as part of the HTML container image
  // so all text (including Korean) renders correctly via browser font engine
  const pageContentH = pageH - marginX * 2;

  // Slice and place image across pages
  let yConsumed = 0; // how many mm of image height have been placed

  while (yConsumed < fullImgH) {
    const sliceH = Math.min(pageContentH, fullImgH - yConsumed);

    // Fraction of original image this slice represents
    const sliceRatio = sliceH / fullImgH;
    const srcY = Math.round((yConsumed / fullImgH) * img.height);
    const srcH = Math.round(sliceRatio * img.height);

    // Draw this slice onto a canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = srcH;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, srcY, img.width, srcH, 0, 0, img.width, srcH);
    }
    const sliceDataUrl = canvas.toDataURL('image/png');

    pdf.addImage(sliceDataUrl, 'PNG', marginX, marginX, contentW, sliceH);

    yConsumed += sliceH;

    if (yConsumed < fullImgH) {
      pdf.addPage();
    }
  }

  pdf.save(`linkedin-analytics-${period}-${today}.pdf`);
}
