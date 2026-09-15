import { API_BASE } from '../config';

/**
 * Universal & Reliable Document Download Helper
 * Solves 'about:blank#blocked' across all browsers (Chrome, Edge, Safari, Firefox)
 * Supports:
 *  - Base64 Data URLs (decodes to binary Blob to bypass Chrome data-URL navigation block)
 *  - Blob URLs
 *  - Same-origin & Cross-origin HTTP/HTTPS URLs (fetches as Blob to force correct filename & avoid browser navigation)
 *  - Server proxy download fallback with Content-Disposition: attachment
 */
export async function downloadDocument(fileUrl, fileName = 'document') {
  if (!fileUrl) {
    console.warn('downloadDocument called without fileUrl');
    return false;
  }

  // Ensure fileName has a reasonable default
  let cleanFileName = (fileName || 'document').trim();
  // Strip illegal filesystem characters
  cleanFileName = cleanFileName.replace(/[<>:"/\\|?*]/g, '_');

  try {
    // ─── 1. BASE64 DATA URL ───
    if (fileUrl.startsWith('data:')) {
      const parts = fileUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const isBase64 = parts[0].includes('base64');
      
      let u8arr;
      if (isBase64) {
        const bstr = atob(parts[1]);
        let n = bstr.length;
        u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
      } else {
        const decoded = decodeURIComponent(parts[1]);
        const encoder = new TextEncoder();
        u8arr = encoder.encode(decoded);
      }

      // Add appropriate extension if missing
      if (!cleanFileName.includes('.')) {
        if (mimeType.includes('pdf')) cleanFileName += '.pdf';
        else if (mimeType.includes('png')) cleanFileName += '.png';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) cleanFileName += '.jpg';
      }

      const blob = new Blob([u8arr], { type: mimeType });
      triggerBlobDownload(blob, cleanFileName);
      return true;
    }

    // ─── 2. BLOB URL ───
    if (fileUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = cleanFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // ─── 3. HTTP / HTTPS / RELATIVE URL ───
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`;

    // Attempt 1: Fetch as binary Blob (guarantees Chrome uses cleanFileName & bypasses cross-origin <a download> block)
    try {
      const res = await fetch(fullUrl, {
        method: 'GET',
        mode: 'cors',
      });

      if (res.ok) {
        const blob = await res.blob();
        
        // Infer extension if not in fileName
        if (!cleanFileName.includes('.')) {
          if (blob.type.includes('pdf')) cleanFileName += '.pdf';
          else if (blob.type.includes('png')) cleanFileName += '.png';
          else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) cleanFileName += '.jpg';
          else if (blob.type.includes('text/plain')) cleanFileName += '.txt';
          else cleanFileName += '.pdf';
        }

        triggerBlobDownload(blob, cleanFileName);
        return true;
      }
    } catch (fetchErr) {
      console.warn('Direct fetch failed, trying server attachment fallback...', fetchErr);
    }

    // Attempt 2: Route through server-side attachment proxy endpoint
    const proxyUrl = `${API_BASE}/api/v1/download-file?url=${encodeURIComponent(fullUrl)}&name=${encodeURIComponent(cleanFileName)}`;
    
    // Create invisible anchor with download attribute
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.setAttribute('download', cleanFileName);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;

  } catch (err) {
    console.error('Failed to download document:', err);
    // Final emergency fallback: direct URL open in new window
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE}${fileUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
    return false;
  }
}

/**
 * Internal helper to trigger native browser file save from Blob
 */
function triggerBlobDownload(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, 2000);
}
