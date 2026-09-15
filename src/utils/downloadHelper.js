import { API_BASE } from '../config';

/**
 * Universal & Comprehensive Extension & MIME Type Map
 * Supports all image and document formats
 */
export const MIME_EXTENSION_MAP = {
  // Images
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/svg+xml': '.svg',
  'image/tiff': '.tiff',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/avif': '.avif',
  'image/x-icon': '.ico',

  // Documents
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/rtf': '.rtf',
  'text/rtf': '.rtf',
  'application/vnd.oasis.opendocument.text': '.odt',
  'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/vnd.oasis.opendocument.presentation': '.odp'
};

export const ALL_ACCEPTED_EXTENSIONS = 
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.rtf,.odt,.ods,.odp,' +
  '.png,.jpg,.jpeg,.webp,.bmp,.svg,.tiff,.tif,.heic,.heif,.gif,.avif,.ico';

export const ALL_ACCEPTED_MIMETYPES =
  'image/*,application/pdf,application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,' +
  'text/plain,text/csv,text/rtf';

export const FILE_INPUT_ACCEPT_STR = `${ALL_ACCEPTED_EXTENSIONS},${ALL_ACCEPTED_MIMETYPES}`;

/**
 * Check if a filename or MIME type is an image
 */
export function isImageFile(fileNameOrUrl = '', mimeType = '') {
  const clean = (fileNameOrUrl || '').toLowerCase().split('?')[0];
  if (
    clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png') ||
    clean.endsWith('.webp') || clean.endsWith('.bmp') || clean.endsWith('.svg') ||
    clean.endsWith('.gif') || clean.endsWith('.tif') || clean.endsWith('.tiff') ||
    clean.endsWith('.avif') || clean.endsWith('.ico') || clean.endsWith('.heic') ||
    clean.endsWith('.heif')
  ) {
    return true;
  }
  return mimeType.startsWith('image/');
}

/**
 * Check if a filename or MIME type is a PDF
 */
export function isPdfFile(fileNameOrUrl = '', mimeType = '') {
  const clean = (fileNameOrUrl || '').toLowerCase().split('?')[0];
  return clean.endsWith('.pdf') || mimeType.includes('pdf');
}

/**
 * Check if a filename or MIME type is plain text or CSV
 */
export function isTextFile(fileNameOrUrl = '', mimeType = '') {
  const clean = (fileNameOrUrl || '').toLowerCase().split('?')[0];
  return clean.endsWith('.txt') || clean.endsWith('.csv') || clean.endsWith('.rtf') || clean.endsWith('.log') || mimeType.startsWith('text/');
}

/**
 * Convert any fileUrl (data URI, relative URL, or cross-origin HTTP URL) to a local Blob Object URL
 */
export async function getBlobUrl(fileUrl, defaultMime = 'application/octet-stream') {
  if (!fileUrl) return null;

  // 1. Data URL
  if (fileUrl.startsWith('data:')) {
    const parts = fileUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : defaultMime;
    const isBase64 = parts[0].includes('base64');
    
    let u8arr;
    if (isBase64) {
      const bstr = atob(parts[1]);
      let n = bstr.length;
      u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
    } else {
      u8arr = new TextEncoder().encode(decodeURIComponent(parts[1]));
    }

    const blob = new Blob([u8arr], { type: mimeType });
    return {
      blobUrl: URL.createObjectURL(blob),
      blob,
      mimeType
    };
  }

  // 2. Blob URL
  if (fileUrl.startsWith('blob:')) {
    return { blobUrl: fileUrl, blob: null, mimeType: defaultMime };
  }

  // 3. HTTP / Relative URL
  const fullUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://') 
    ? fileUrl 
    : `${API_BASE}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

  try {
    const res = await fetch(fullUrl, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return {
        blobUrl: URL.createObjectURL(blob),
        blob,
        mimeType: blob.type || defaultMime
      };
    }
  } catch (e) {
    console.warn('Direct fetch failed, returning fullUrl:', e);
  }

  return { blobUrl: fullUrl, blob: null, mimeType: defaultMime };
}

/**
 * Universal & Reliable Document Download Helper
 */
export async function downloadDocument(fileUrl, fileName = 'document') {
  if (!fileUrl) {
    console.warn('downloadDocument called without fileUrl');
    return false;
  }

  let cleanFileName = (fileName || 'document').trim().replace(/[<>:"/\\|?*]/g, '_');

  try {
    const blobData = await getBlobUrl(fileUrl);
    if (blobData && blobData.blobUrl) {
      // Ensure file has extension
      if (!cleanFileName.includes('.')) {
        const ext = MIME_EXTENSION_MAP[blobData.mimeType] || (isImageFile('', blobData.mimeType) ? '.jpg' : '.pdf');
        cleanFileName += ext;
      }

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobData.blobUrl;
      a.download = cleanFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        if (fileUrl.startsWith('data:') || !fileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobData.blobUrl);
        }
      }, 2000);
      return true;
    }

    // Fallback: proxy download endpoint
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`;
    const proxyUrl = `${API_BASE}/api/v1/download-file?url=${encodeURIComponent(fullUrl)}&name=${encodeURIComponent(cleanFileName)}`;
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.setAttribute('download', cleanFileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Download error:', err);
    return false;
  }
}

/**
 * Universal Native PC / Browser Print Engine
 * Handles all images, PDFs, office documents, and text files flawlessly with native OS print dialog
 */
export async function executePrintWithPC(order) {
  if (!order) {
    window.print();
    return;
  }

  const item = order.items?.[0] || {};
  const fileUrl = item.fileUrl;
  const fileName = item.fileName || 'document';

  if (!fileUrl) {
    window.print();
    return;
  }

  try {
    const isImage = isImageFile(fileName);
    const isPdf = isPdfFile(fileName);
    const isText = isTextFile(fileName);

    const blobData = await getBlobUrl(fileUrl, isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream');
    const targetUrl = blobData?.blobUrl || (fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`);

    // ─── 1. IMAGE PRINTING ───
    if (isImage) {
      const printWindow = window.open('', '_blank', 'width=900,height=1000');
      if (printWindow) {
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print - ${fileName}</title>
  <style>
    @page { size: auto; margin: 4mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .no-print {
      width: 100%;
      max-width: 800px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 18px;
      background: #1e293b;
      color: #f8fafc;
      border-radius: 10px;
      border: 1px solid #334155;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .print-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .print-btn:hover { background: #4338ca; }
    .img-wrapper {
      width: 100%;
      max-width: 800px;
      background: white;
      padding: 8px;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    img {
      max-width: 100%;
      height: auto;
      max-height: 85vh;
      object-fit: contain;
      display: block;
      margin: 0 auto;
    }
    @media print {
      body { margin: 0; padding: 0; background: white; min-height: unset; display: block; }
      .no-print { display: none !important; }
      .img-wrapper { padding: 0; box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; }
      img { width: 100%; max-height: 100%; object-fit: contain; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <span>🖼️ <strong>${fileName}</strong> &middot; Token: #${order.pickupToken || '—'} &middot; Specs: ${item.colorMode === 'COLOR' ? 'Color' : 'B&W'}, ${item.paperSize || 'A4'}</span>
    <button class="print-btn" onclick="triggerPrint()">🖨️ Print Document</button>
  </div>
  <div class="img-wrapper">
    <img id="printImage" src="${targetUrl}" alt="${fileName}" />
  </div>
  <script>
    function triggerPrint() {
      window.focus();
      setTimeout(function() {
        window.print();
      }, 350);
    }
    const el = document.getElementById('printImage');
    if (el.complete) {
      triggerPrint();
    } else {
      el.onload = triggerPrint;
      el.onerror = function() {
        console.warn('Image load event fallback');
        triggerPrint();
      };
    }
  </script>
</body>
</html>`;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        return;
      }
    }

    // ─── 2. PLAIN TEXT / CSV / RTF PRINTING ───
    if (isText && blobData?.blob) {
      const textContent = await blobData.blob.text();
      const printWindow = window.open('', '_blank', 'width=900,height=1000');
      if (printWindow) {
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print - ${fileName}</title>
  <style>
    @page { size: auto; margin: 12mm; }
    body {
      margin: 0;
      padding: 24px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #0f172a;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .no-print {
      margin-bottom: 20px;
      padding: 10px 16px;
      background: #1e293b;
      color: white;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <span>📄 <strong>${fileName}</strong> &middot; Order #${order.pickupToken || order.id}</span>
    <button class="print-btn" onclick="window.print()">🖨️ Print Document</button>
  </div>
  <div class="header">
    <strong>${fileName}</strong>
    <span>Customer: ${order.customerName || 'Walk-in'} &middot; Token: #${order.pickupToken || '—'}</span>
  </div>
  <pre>${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  <script>
    window.onload = function() {
      window.focus();
      setTimeout(function() { window.print(); }, 350);
    };
  </script>
</body>
</html>`;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        return;
      }
    }

    // ─── 3. PDF & ALL OTHER DOCUMENTS (PDF, DOCX, XLSX, PPTX) ───
    const printWindow = window.open(targetUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      setTimeout(() => {
        try { printWindow.print(); } catch (e) {}
      }, 1200);
    }
  } catch (err) {
    console.error('executePrintWithPC error:', err);
    window.open(fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`, '_blank');
  }
}
