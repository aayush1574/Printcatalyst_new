import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Crop, Move, Maximize2 } from 'lucide-react';
import { API_BASE } from '../config';

/**
 * Dynamic Image Crop & Zoom Modal
 * Features:
 * - Draggable crop rectangle with resize handles
 * - Zoom slider (0.5x–3x) 
 * - Pan the zoomed image by dragging
 * - Live preview of cropped area
 * - Apply produces a cropped Blob URL
 */
export default function ImageCropModal({ imageUrl, fileName, isOpen, onClose, onApply }) {
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgNatW, setImgNatW] = useState(0);
  const [imgNatH, setImgNatH] = useState(0);

  // Display dimensions (fit within container)
  const [dispW, setDispW] = useState(0);
  const [dispH, setDispH] = useState(0);
  const [dispX, setDispX] = useState(0);
  const [dispY, setDispY] = useState(0);

  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Crop rectangle (in display coordinates relative to the canvas)
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [cropW, setCropW] = useState(200);
  const [cropH, setCropH] = useState(200);

  // Interaction state
  const [dragging, setDragging] = useState(null); // null | 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'pan'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragInitial, setDragInitial] = useState({});

  // Rotation
  const [rotation, setRotation] = useState(0);

  // Load image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    setImgLoaded(false);

    const resolvedUrl = imageUrl.startsWith('http') || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')
      ? imageUrl
      : `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgNatW(img.naturalWidth || 800);
      setImgNatH(img.naturalHeight || 1000);
      setImgLoaded(true);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    };
    img.onerror = () => {
      // Retry without anonymous crossOrigin if CORS blocks canvas
      const imgNoCors = new Image();
      imgNoCors.onload = () => {
        imgRef.current = imgNoCors;
        setImgNatW(imgNoCors.naturalWidth || 800);
        setImgNatH(imgNoCors.naturalHeight || 1000);
        setImgLoaded(true);
      };
      imgNoCors.src = resolvedUrl;
    };
    img.src = resolvedUrl;
    return () => { img.onload = null; img.onerror = null; };
  }, [isOpen, imageUrl]);

  // Calculate display dimensions when image or container changes
  useEffect(() => {
    if (!imgLoaded || !containerRef.current) return;
    const container = containerRef.current;
    const maxW = container.clientWidth - 20;
    const maxH = container.clientHeight - 20;
    
    const natW = rotation % 180 === 0 ? imgNatW : imgNatH;
    const natH = rotation % 180 === 0 ? imgNatH : imgNatW;
    
    const scale = Math.min(maxW / natW, maxH / natH, 1);
    const dw = Math.round(natW * scale);
    const dh = Math.round(natH * scale);
    const dx = Math.round((maxW - dw) / 2) + 10;
    const dy = Math.round((maxH - dh) / 2) + 10;

    setDispW(dw);
    setDispH(dh);
    setDispX(dx);
    setDispY(dy);

    // Initialize crop to 70% centered
    const cw = Math.round(dw * 0.7);
    const ch = Math.round(dh * 0.7);
    setCropX(dx + Math.round((dw - cw) / 2));
    setCropY(dy + Math.round((dh - ch) / 2));
    setCropW(cw);
    setCropH(ch);
  }, [imgLoaded, imgNatW, imgNatH, rotation]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imgRef.current;
    if (!canvas || !ctx || !img || !imgLoaded) return;

    const container = containerRef.current;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image with zoom and pan
    ctx.save();
    const centerX = dispX + dispW / 2 + panX;
    const centerY = dispY + dispH / 2 + panY;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -dispW / 2, -dispH / 2, dispW, dispH);
    ctx.restore();

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the crop area to show image
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.clip();
    
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -dispW / 2, -dispH / 2, dispW, dispH);
    ctx.restore();

    // Draw crop border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Draw rule of thirds grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cropX + (cropW / 3) * i, cropY);
      ctx.lineTo(cropX + (cropW / 3) * i, cropY + cropH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cropX, cropY + (cropH / 3) * i);
      ctx.lineTo(cropX + cropW, cropY + (cropH / 3) * i);
      ctx.stroke();
    }

    // Draw corner handles
    const handleSize = 10;
    ctx.fillStyle = '#6366f1';
    const corners = [
      [cropX, cropY], // nw
      [cropX + cropW, cropY], // ne
      [cropX, cropY + cropH], // sw
      [cropX + cropW, cropY + cropH], // se
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    });

    // Draw edge midpoint handles
    ctx.fillStyle = '#818cf8';
    const edges = [
      [cropX + cropW / 2, cropY], // n
      [cropX + cropW / 2, cropY + cropH], // s
      [cropX, cropY + cropH / 2], // w
      [cropX + cropW, cropY + cropH / 2], // e
    ];
    edges.forEach(([cx, cy]) => {
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
    });

    // Dimensions text
    const natCrop = getCropInNaturalCoords();
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '11px monospace';
    ctx.fillText(`${Math.round(natCrop.w)} × ${Math.round(natCrop.h)} px`, cropX + 4, cropY - 6);

  }, [imgLoaded, zoom, panX, panY, rotation, dispW, dispH, dispX, dispY, cropX, cropY, cropW, cropH]);

  // Draw preview
  const drawPreview = useCallback(() => {
    const pCanvas = previewCanvasRef.current;
    const pCtx = pCanvas?.getContext('2d');
    const img = imgRef.current;
    if (!pCanvas || !pCtx || !img || !imgLoaded) return;

    const natCrop = getCropInNaturalCoords();
    const previewSize = 200;
    const aspect = natCrop.w / natCrop.h;
    let pw, ph;
    if (aspect > 1) { pw = previewSize; ph = previewSize / aspect; }
    else { ph = previewSize; pw = previewSize * aspect; }

    pCanvas.width = Math.max(1, Math.round(pw));
    pCanvas.height = Math.max(1, Math.round(ph));

    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    
    // Draw cropped region
    pCtx.save();
    if (rotation !== 0) {
      // For rotated images, use a temporary canvas
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (rotation % 180 === 0) {
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
      } else {
        tempCanvas.width = img.naturalHeight;
        tempCanvas.height = img.naturalWidth;
      }
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      pCtx.drawImage(tempCanvas, natCrop.x, natCrop.y, natCrop.w, natCrop.h, 0, 0, pCanvas.width, pCanvas.height);
    } else {
      pCtx.drawImage(img, natCrop.x, natCrop.y, natCrop.w, natCrop.h, 0, 0, pCanvas.width, pCanvas.height);
    }
    pCtx.restore();
  }, [imgLoaded, zoom, panX, panY, rotation, dispW, dispH, dispX, dispY, cropX, cropY, cropW, cropH]);

  useEffect(() => {
    if (imgLoaded) {
      drawCanvas();
      drawPreview();
    }
  }, [drawCanvas, drawPreview, imgLoaded]);

  // Convert crop rect from display coords to natural image coords
  const getCropInNaturalCoords = useCallback(() => {
    const centerX = dispX + dispW / 2 + panX;
    const centerY = dispY + dispH / 2 + panY;

    // Inverse transform: from canvas coords to image coords
    const natW = rotation % 180 === 0 ? imgNatW : imgNatH;
    const natH = rotation % 180 === 0 ? imgNatH : imgNatW;
    const scaleX = natW / (dispW * zoom);
    const scaleY = natH / (dispH * zoom);

    // Crop corners relative to the zoomed/panned image center
    const relX = cropX - centerX;
    const relY = cropY - centerY;
    
    // Undo zoom
    const imgX = (relX / zoom + dispW / 2) * (natW / dispW);
    const imgY = (relY / zoom + dispH / 2) * (natH / dispH);
    const imgW = (cropW / zoom) * (natW / dispW);
    const imgH = (cropH / zoom) * (natH / dispH);

    return {
      x: Math.max(0, Math.round(imgX)),
      y: Math.max(0, Math.round(imgY)),
      w: Math.max(1, Math.round(imgW)),
      h: Math.max(1, Math.round(imgH))
    };
  }, [dispW, dispH, dispX, dispY, panX, panY, zoom, rotation, cropX, cropY, cropW, cropH, imgNatW, imgNatH]);

  // Mouse handlers for crop dragging
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const getHitTarget = (pos) => {
    const handleSize = 14;
    const hx = pos.x, hy = pos.y;

    // Corner handles
    if (Math.abs(hx - cropX) < handleSize && Math.abs(hy - cropY) < handleSize) return 'nw';
    if (Math.abs(hx - (cropX + cropW)) < handleSize && Math.abs(hy - cropY) < handleSize) return 'ne';
    if (Math.abs(hx - cropX) < handleSize && Math.abs(hy - (cropY + cropH)) < handleSize) return 'sw';
    if (Math.abs(hx - (cropX + cropW)) < handleSize && Math.abs(hy - (cropY + cropH)) < handleSize) return 'se';

    // Edge handles
    if (Math.abs(hy - cropY) < handleSize && hx > cropX + handleSize && hx < cropX + cropW - handleSize) return 'n';
    if (Math.abs(hy - (cropY + cropH)) < handleSize && hx > cropX + handleSize && hx < cropX + cropW - handleSize) return 's';
    if (Math.abs(hx - cropX) < handleSize && hy > cropY + handleSize && hy < cropY + cropH - handleSize) return 'w';
    if (Math.abs(hx - (cropX + cropW)) < handleSize && hy > cropY + handleSize && hy < cropY + cropH - handleSize) return 'e';

    // Inside crop = move
    if (hx >= cropX && hx <= cropX + cropW && hy >= cropY && hy <= cropY + cropH) return 'move';

    // Outside crop = pan
    return 'pan';
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    const target = getHitTarget(pos);
    setDragging(target);
    setDragStart(pos);
    setDragInitial({ cropX, cropY, cropW, cropH, panX, panY });
  };

  const handlePointerMove = (e) => {
    if (!dragging) {
      // Update cursor
      const pos = getMousePos(e);
      const target = getHitTarget(pos);
      const canvas = canvasRef.current;
      if (canvas) {
        const cursors = {
          nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
          n: 'n-resize', s: 's-resize', w: 'w-resize', e: 'e-resize',
          move: 'move', pan: 'grab'
        };
        canvas.style.cursor = cursors[target] || 'default';
      }
      return;
    }
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    const minSize = 30;

    if (dragging === 'move') {
      setCropX(dragInitial.cropX + dx);
      setCropY(dragInitial.cropY + dy);
    } else if (dragging === 'pan') {
      setPanX(dragInitial.panX + dx);
      setPanY(dragInitial.panY + dy);
    } else if (dragging === 'se') {
      setCropW(Math.max(minSize, dragInitial.cropW + dx));
      setCropH(Math.max(minSize, dragInitial.cropH + dy));
    } else if (dragging === 'nw') {
      const newW = Math.max(minSize, dragInitial.cropW - dx);
      const newH = Math.max(minSize, dragInitial.cropH - dy);
      setCropX(dragInitial.cropX + dragInitial.cropW - newW);
      setCropY(dragInitial.cropY + dragInitial.cropH - newH);
      setCropW(newW);
      setCropH(newH);
    } else if (dragging === 'ne') {
      const newW = Math.max(minSize, dragInitial.cropW + dx);
      const newH = Math.max(minSize, dragInitial.cropH - dy);
      setCropY(dragInitial.cropY + dragInitial.cropH - newH);
      setCropW(newW);
      setCropH(newH);
    } else if (dragging === 'sw') {
      const newW = Math.max(minSize, dragInitial.cropW - dx);
      const newH = Math.max(minSize, dragInitial.cropH + dy);
      setCropX(dragInitial.cropX + dragInitial.cropW - newW);
      setCropW(newW);
      setCropH(newH);
    } else if (dragging === 'n') {
      const newH = Math.max(minSize, dragInitial.cropH - dy);
      setCropY(dragInitial.cropY + dragInitial.cropH - newH);
      setCropH(newH);
    } else if (dragging === 's') {
      setCropH(Math.max(minSize, dragInitial.cropH + dy));
    } else if (dragging === 'w') {
      const newW = Math.max(minSize, dragInitial.cropW - dx);
      setCropX(dragInitial.cropX + dragInitial.cropW - newW);
      setCropW(newW);
    } else if (dragging === 'e') {
      setCropW(Math.max(minSize, dragInitial.cropW + dx));
    }
  };

  const handlePointerUp = () => {
    if (dragging === 'pan') {
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = 'grab';
    }
    setDragging(null);
  };

  // Apply crop — produce a cropped image blob URL
  const handleApply = () => {
    const img = imgRef.current;
    if (!img) return;

    const natCrop = getCropInNaturalCoords();
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = natCrop.w;
    outputCanvas.height = natCrop.h;
    const outCtx = outputCanvas.getContext('2d');

    if (rotation !== 0) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (rotation % 180 === 0) {
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
      } else {
        tempCanvas.width = img.naturalHeight;
        tempCanvas.height = img.naturalWidth;
      }
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      outCtx.drawImage(tempCanvas, natCrop.x, natCrop.y, natCrop.w, natCrop.h, 0, 0, natCrop.w, natCrop.h);
    } else {
      outCtx.drawImage(img, natCrop.x, natCrop.y, natCrop.w, natCrop.h, 0, 0, natCrop.w, natCrop.h);
    }

    outputCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onApply(url);
      }
      onClose();
    }, 'image/png');
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetCrop = () => {
    setCropX(dispX + Math.round(dispW * 0.15));
    setCropY(dispY + Math.round(dispH * 0.15));
    setCropW(Math.round(dispW * 0.7));
    setCropH(Math.round(dispH * 0.7));
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
              <Crop className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-white truncate">Edit & Crop</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          
          {/* Canvas area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            
            {/* Toolbar */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center gap-2 sm:gap-3 text-xs flex-shrink-0">
              <button
                onClick={handleRotate}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700"
              >
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Rotate</span>
              </button>

              <button
                onClick={handleResetCrop}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={zoom * 100}
                  onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
                  className="w-20 sm:w-32 accent-indigo-500 h-1.5"
                />
                <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-mono text-[10px] sm:text-[11px] w-10 text-right">{Math.round(zoom * 100)}%</span>
              </div>
            </div>

            {/* Canvas container */}
            <div
              ref={containerRef}
              className="flex-1 bg-[#0a0e17] relative overflow-hidden min-h-[250px] sm:min-h-[300px]"
            >
              {imgLoaded ? (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                  Loading image...
                </div>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-64 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 flex-shrink-0">
            
            {/* Preview */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Crop Preview</h4>
              <div className="bg-[#0a0e17] rounded-xl border border-slate-800 p-2 sm:p-3 flex items-center justify-center min-h-[100px] sm:min-h-[140px]">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[100px] sm:max-h-[130px] rounded-md shadow-lg"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-[10px] sm:text-[11px] text-slate-400">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How to use</h4>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <Move className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>Drag <strong className="text-white">inside</strong> the crop box to move it</span>
                </div>
                <div className="flex items-start gap-2">
                  <Crop className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                  <span>Drag <strong className="text-white">corners/edges</strong> to resize</span>
                </div>
                <div className="flex items-start gap-2">
                  <ZoomIn className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Use <strong className="text-white">zoom slider</strong> to zoom in/out</span>
                </div>
                <div className="flex items-start gap-2">
                  <Move className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Drag <strong className="text-white">outside</strong> crop box to pan image</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-2 pt-2">
              <button
                onClick={handleApply}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Apply Crop</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
