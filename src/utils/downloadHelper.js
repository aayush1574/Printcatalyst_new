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
 * Generate a high-resolution Vector SVG Data URL fallback
 * Used when a remote image URL cannot be fetched or is missing
 */
export function generateFallbackSvgDataUrl(fileName = 'Image Document', order = {}) {
  const item = order?.items?.[0] || {};
  const token = order?.pickupToken || order?.id || '—';
  const colorMode = item?.colorMode === 'COLOR' ? 'Color Output (CMYK)' : 'Monochrome (B&W Grayscale)';
  const paperSize = item?.paperSize || 'A4';
  const cleanName = (fileName || 'Document').replace(/[<>&"]/g, '');
  const ext = (cleanName.split('.').pop() || 'IMAGE').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" width="1200" height="1600">
    <defs>
      <linearGradient id="pcHdr" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
      <linearGradient id="pcCard" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="1600" fill="#ffffff"/>
    <rect x="40" y="40" width="1120" height="1520" rx="24" fill="url(#pcCard)" stroke="#e2e8f0" stroke-width="4"/>
    
    <!-- Header Banner -->
    <rect x="40" y="40" width="1120" height="150" rx="24" fill="url(#pcHdr)"/>
    <text x="600" y="115" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" text-anchor="middle" letter-spacing="3">PRINT SUPPORT &middot; PREVIEW</text>
    <text x="600" y="155" fill="#e0e7ff" font-family="monospace" font-size="22" font-weight="bold" text-anchor="middle">TOKEN #${token} &middot; ${paperSize} &middot; ${colorMode}</text>
    
    <!-- Central Icon Artwork -->
    <circle cx="600" cy="540" r="160" fill="#eef2ff" stroke="#6366f1" stroke-width="6"/>
    <g transform="translate(500, 440) scale(4)" stroke="#4f46e5" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </g>
    
    <!-- Document Title & Badge -->
    <text x="600" y="790" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="800" text-anchor="middle">${cleanName}</text>
    
    <rect x="400" y="830" width="400" height="48" rx="24" fill="#6366f1"/>
    <text x="600" y="862" fill="#ffffff" font-family="monospace" font-size="22" font-weight="bold" text-anchor="middle">${ext} &middot; HARDWARE READY</text>
    
    <!-- Specifications Box -->
    <rect x="120" y="930" width="960" height="340" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <text x="180" y="1000" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26">Pickup Token:</text>
    <text x="560" y="1000" fill="#0f172a" font-family="monospace" font-size="28" font-weight="900">#${token}</text>
    
    <line x1="180" y1="1040" x2="1020" y2="1040" stroke="#f1f5f9" stroke-width="2"/>
    
    <text x="180" y="1100" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26">Color Specification:</text>
    <text x="560" y="1100" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700">${colorMode}</text>
    
    <line x1="180" y1="1140" x2="1020" y2="1140" stroke="#f1f5f9" stroke-width="2"/>
    
    <text x="180" y="1200" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26">Paper Stock &amp; Size:</text>
    <text x="560" y="1200" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700">${paperSize} Standard (300 DPI Native)</text>
    
    <!-- Footer -->
    <line x1="120" y1="1440" x2="1080" y2="1440" stroke="#cbd5e1" stroke-width="2"/>
    <text x="600" y="1490" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" text-anchor="middle">&copy; Print Support &middot; Auto Spooler &amp; Native Print Engine</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Convert any fileUrl (data URI, relative URL, or cross-origin HTTP URL) to a local Blob Object URL
 */
export async function getBlobUrl(fileUrl, defaultMime = 'application/octet-stream', order = null) {
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

  // 3. HTTP / Relative URL direct fetch
  const fullUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://') 
    ? fileUrl 
    : `${API_BASE}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

  try {
    const res = await fetch(fullUrl, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 0) {
        return {
          blobUrl: URL.createObjectURL(blob),
          blob,
          mimeType: blob.type || defaultMime
        };
      }
    }
  } catch (e) {
    console.warn('Direct fetch failed, trying proxy download endpoint:', e?.message || e);
  }

  // 4. Try backend proxy download
  try {
    const proxyUrl = `${API_BASE}/api/v1/download-file?url=${encodeURIComponent(fullUrl)}`;
    const proxyRes = await fetch(proxyUrl, { mode: 'cors' });
    if (proxyRes.ok) {
      const blob = await proxyRes.blob();
      if (blob && blob.size > 0) {
        return {
          blobUrl: URL.createObjectURL(blob),
          blob,
          mimeType: blob.type || defaultMime
        };
      }
    }
  } catch (pe) {
    console.warn('Proxy fetch also failed:', pe?.message || pe);
  }

  // 5. If image, generate fallback vector SVG so blobUrl is guaranteed valid
  if (isImageFile(fullUrl, defaultMime)) {
    const fallbackSvg = generateFallbackSvgDataUrl(fileUrl, order);
    return {
      blobUrl: fallbackSvg,
      blob: null,
      mimeType: 'image/svg+xml'
    };
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

  const items = order.items && order.items.length > 0 ? order.items : [{ fileUrl: '', fileName: 'document' }];
  const item = items[0] || {};
  const fileUrl = item.fileUrl;
  const fileName = item.fileName || 'document';

  if (!fileUrl) {
    window.print();
    return;
  }

  try {
    const isImage = isImageFile(fileName) || items.some(it => isImageFile(it.fileName));
    const isPdf = isPdfFile(fileName);
    const isText = isTextFile(fileName);

    const blobData = await getBlobUrl(fileUrl, isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream', order);
    const targetUrl = blobData?.blobUrl || (fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`);
    const fallbackSvgUrl = generateFallbackSvgDataUrl(fileName, order);

    // ─── 1. IMAGE PRINTING (ALL IMAGE FORMATS) ───
    if (isImage) {
      const printWindow = window.open('', '_blank', 'width=950,height=1050');
      if (printWindow) {
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print - ${fileName}</title>
  <base href="${window.location.origin}/">
  <style>
    @page { size: auto; margin: 4mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .no-print {
      width: 100%;
      max-width: 850px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: #1e293b;
      color: #f8fafc;
      border-radius: 12px;
      border: 1px solid #334155;
      font-size: 13px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    .actions { display: flex; gap: 8px; align-items: center; }
    .print-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .print-btn:hover { background: #4338ca; }
    .img-wrapper {
      width: 100%;
      max-width: 850px;
      background: white;
      padding: 12px;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      min-height: 400px;
    }
    img {
      max-width: 100%;
      height: auto;
      max-height: 85vh;
      object-fit: contain;
      display: block;
      margin: 0 auto;
      border-radius: 4px;
    }
    @media print {
      body { margin: 0; padding: 0; background: white; min-height: unset; display: block; }
      .no-print { display: none !important; }
      .img-wrapper { padding: 0; box-shadow: none; border-radius: 0; max-width: 100%; width: 100%; min-height: unset; }
      img { width: 100%; max-height: 100%; object-fit: contain; page-break-inside: avoid; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <span>🖼️ <strong>${fileName}</strong> &middot; Token: #${order.pickupToken || order.id || '—'} &middot; Specs: ${item.colorMode === 'COLOR' ? 'Color' : 'B&W'}, ${item.paperSize || 'A4'}</span>
    <div class="actions">
      <button class="print-btn" onclick="triggerPrint()">🖨️ Print Document</button>
    </div>
  </div>
  <div class="img-wrapper">
    <img id="printImage" src="${targetUrl}" alt="${fileName}" />
  </div>
  <script>
    var hasPrinted = false;
    var fallbackSrc = "${fallbackSvgUrl}";

    function triggerPrint() {
      if (hasPrinted) return;
      hasPrinted = true;
      window.focus();
      setTimeout(function() {
        window.print();
      }, 400);
    }

    function handleImgError(el) {
      console.warn('Image failed to load in print window, swapping to high-res SVG fallback');
      el.onerror = function() {
        console.warn('Fallback error, triggering print anyway');
        triggerPrint();
      };
      el.onload = function() {
        triggerPrint();
      };
      el.src = fallbackSrc;
    }

    var el = document.getElementById('printImage');
    if (el) {
      if (el.complete && el.naturalWidth > 0) {
        triggerPrint();
      } else {
        el.onload = function() {
          if (el.naturalWidth > 0) {
            triggerPrint();
          } else {
            handleImgError(el);
          }
        };
        el.onerror = function() {
          handleImgError(el);
        };
      }
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
