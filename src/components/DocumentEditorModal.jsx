import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Crop, Maximize2, Sliders, Sun, Contrast, Check, RefreshCw,
  Sparkles, Layers, FileText, ArrowLeftRight, ArrowUpDown, Move
} from 'lucide-react';

const ASPECT_RATIOS = [
  { id: 'free', label: 'Freeform', ratio: null },
  { id: 'a4', label: 'A4 Page (1:1.41)', ratio: 1 / 1.414 },
  { id: 'square', label: '1:1 Square', ratio: 1 },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3 },
  { id: '16:9', label: '16:9 Widescreen', ratio: 16 / 9 },
  { id: '4:6', label: '4×6 Photo', ratio: 4 / 6 },
];

export default function DocumentEditorModal({ item, isOpen, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('crop'); // 'crop' | 'resize' | 'rotate' | 'enhance'
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgElement, setImgElement] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 800, height: 1000 });

  // Transform states
  const [rotation, setRotation] = useState(item?.editState?.rotation || 0); // degrees
  const [flipH, setFlipH] = useState(item?.editState?.flipH || false);
  const [flipV, setFlipV] = useState(item?.editState?.flipV || false);
  const [scale, setScale] = useState(item?.editState?.scale || 1.0);
  
  // Custom resize fields
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(1000);
  const [lockAspect, setLockAspect] = useState(true);

  // Filter states
  const [brightness, setBrightness] = useState(item?.editState?.brightness || 100);
  const [contrast, setContrast] = useState(item?.editState?.contrast || 100);
  const [grayscale, setGrayscale] = useState(item?.editState?.grayscale || false);

  // Crop states (percentages 0 - 100)
  const [aspectRatio, setAspectRatio] = useState('free');
  const [crop, setCrop] = useState(item?.editState?.crop || { x: 5, y: 5, width: 90, height: 90 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 5, y: 5, width: 90, height: 90 });

  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Load document / image source
  useEffect(() => {
    if (!isOpen || !item) return;

    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // For PDFs or non-image documents, render placeholder / sample canvas preview if fileUrl is not direct image
    const src = item.fileUrl || item.previewUrl || '';
    img.src = src;

    img.onload = () => {
      setImgElement(img);
      setNaturalSize({ width: img.naturalWidth || 800, height: img.naturalHeight || 1000 });
      setTargetWidth(Math.round((img.naturalWidth || 800) * scale));
      setTargetHeight(Math.round((img.naturalHeight || 1000) * scale));
      setImageLoaded(true);
    };

    img.onerror = () => {
      // Fallback generator for documents without direct image URL (e.g. PDFs)
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1240;
      fallbackCanvas.height = 1754;
      const ctx = fallbackCanvas.getContext('2d');

      // Draw paper background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1240, 1754);

      // Header stripe
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(40, 40, 1160, 120);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(item.fileName || 'DOCUMENT PREVIEW', 80, 110);

      // Simulated document content text lines
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 24; i++) {
        const w = 400 + Math.sin(i * 1.5) * 350;
        ctx.fillRect(80, 220 + i * 55, Math.min(1080, Math.max(300, w)), 18);
      }

      // Stamp
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 6;
      ctx.strokeRect(800, 1450, 360, 160);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('PRINT READY', 870, 1540);

      const fallbackImg = new Image();
      fallbackImg.src = fallbackCanvas.toDataURL('image/png');
      fallbackImg.onload = () => {
        setImgElement(fallbackImg);
        setNaturalSize({ width: 1240, height: 1754 });
        setTargetWidth(Math.round(1240 * scale));
        setTargetHeight(Math.round(1754 * scale));
        setImageLoaded(true);
      };
    };
  }, [isOpen, item]);

  // Update target dimensions when scale or image size changes
  const handleScaleChange = (newScale) => {
    setScale(newScale);
    if (imgElement) {
      setTargetWidth(Math.round(naturalSize.width * newScale));
      setTargetHeight(Math.round(naturalSize.height * newScale));
    }
  };

  const handleWidthChange = (val) => {
    const w = Math.max(50, parseInt(val) || 50);
    setTargetWidth(w);
    if (lockAspect && naturalSize.width > 0) {
      const ratio = naturalSize.height / naturalSize.width;
      setTargetHeight(Math.round(w * ratio));
      setScale(parseFloat((w / naturalSize.width).toFixed(2)));
    }
  };

  const handleHeightChange = (val) => {
    const h = Math.max(50, parseInt(val) || 50);
    setTargetHeight(h);
    if (lockAspect && naturalSize.height > 0) {
      const ratio = naturalSize.width / naturalSize.height;
      setTargetWidth(Math.round(h * ratio));
      setScale(parseFloat((h / naturalSize.height).toFixed(2)));
    }
  };

  // Enforce aspect ratio preset on crop state
  const applyAspectRatioPreset = (presetId) => {
    setAspectRatio(presetId);
    if (presetId === 'free') return;

    const preset = ASPECT_RATIOS.find((r) => r.id === presetId);
    if (!preset || !preset.ratio) return;

    const targetRatio = preset.ratio; // width / height
    let newWidth = crop.width;
    let newHeight = newWidth / targetRatio;

    if (newHeight > 90) {
      newHeight = 90;
      newWidth = newHeight * targetRatio;
    }

    setCrop((prev) => ({
      ...prev,
      width: Math.min(95, Math.max(10, newWidth)),
      height: Math.min(95, Math.max(10, newHeight)),
    }));
  };

  // Render document preview on preview canvas
  useEffect(() => {
    if (!imageLoaded || !imgElement || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set preview canvas internal dimension
    canvas.width = 600;
    canvas.height = 700;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Center origin
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation & flip
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply brightness / contrast filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : ''}`;

    // Fit image inside preview box preserving aspect ratio
    const imgRatio = imgElement.width / imgElement.height;
    const boxRatio = (canvas.width * 0.8) / (canvas.height * 0.8);
    let drawW, drawH;

    if (imgRatio > boxRatio) {
      drawW = canvas.width * 0.75;
      drawH = drawW / imgRatio;
    } else {
      drawH = canvas.height * 0.75;
      drawW = drawH * imgRatio;
    }

    ctx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [imageLoaded, imgElement, rotation, flipH, flipV, brightness, contrast, grayscale]);

  // Crop interaction handlers (Mouse / Touch)
  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCropStart({ ...crop });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCrop((prev) => {
      let { x, y, width, height } = cropStart;

      if (dragHandle === 'move') {
        x = Math.max(0, Math.min(100 - width, cropStart.x + deltaXPercent));
        y = Math.max(0, Math.min(100 - height, cropStart.y + deltaYPercent));
      } else {
        if (dragHandle.includes('e')) {
          width = Math.max(10, Math.min(100 - x, cropStart.width + deltaXPercent));
        }
        if (dragHandle.includes('s')) {
          height = Math.max(10, Math.min(100 - y, cropStart.height + deltaYPercent));
        }
        if (dragHandle.includes('w')) {
          const maxDeltaW = cropStart.width - 10;
          const clampedDeltaX = Math.min(maxDeltaW, Math.max(-cropStart.x, deltaXPercent));
          x = cropStart.x + clampedDeltaX;
          width = cropStart.width - clampedDeltaX;
        }
        if (dragHandle.includes('n')) {
          const maxDeltaH = cropStart.height - 10;
          const clampedDeltaY = Math.min(maxDeltaH, Math.max(-cropStart.y, deltaYPercent));
          y = cropStart.y + clampedDeltaY;
          height = cropStart.height - clampedDeltaY;
        }
      }

      return { x, y, width, height };
    });
  }, [isDragging, dragHandle, dragStart, cropStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset all editing parameters
  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setScale(1.0);
    setBrightness(100);
    setContrast(100);
    setGrayscale(false);
    setAspectRatio('free');
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
    if (imgElement) {
      setTargetWidth(imgElement.naturalWidth || 800);
      setTargetHeight(imgElement.naturalHeight || 1000);
    }
  };

  // High-Resolution Export Engine
  const handleSaveEdits = () => {
    if (!imgElement) return;

    // 1. Create offscreen canvas for final processed image
    const origW = imgElement.naturalWidth || 800;
    const origH = imgElement.naturalHeight || 1000;

    // Determine bounding box dimension after rotation
    const rad = (rotation * Math.PI) / 180;
    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));

    const rotatedW = Math.round(origW * absCos + origH * absSin);
    const rotatedH = Math.round(origW * absSin + origH * absCos);

    // Canvas for rotation, flip & filter
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rotatedW;
    tempCanvas.height = rotatedH;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.save();
    tempCtx.translate(rotatedW / 2, rotatedH / 2);
    tempCtx.rotate(rad);
    tempCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    tempCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : ''}`;
    tempCtx.drawImage(imgElement, -origW / 2, -origH / 2, origW, origH);
    tempCtx.restore();

    // 2. Apply crop bounding rectangle
    const cropX = Math.round((crop.x / 100) * rotatedW);
    const cropY = Math.round((crop.y / 100) * rotatedH);
    const cropW = Math.max(10, Math.round((crop.width / 100) * rotatedW));
    const cropH = Math.max(10, Math.round((crop.height / 100) * rotatedH));

    // 3. Final output canvas (resized to target dimensions if scaled)
    const outW = Math.round(cropW * scale);
    const outH = Math.round(cropH * scale);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = outW;
    finalCanvas.height = outH;
    const finalCtx = finalCanvas.getContext('2d');

    // Draw cropped region with high quality image smoothing
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.drawImage(
      tempCanvas,
      cropX, cropY, cropW, cropH,
      0, 0, outW, outH
    );

    const editedDataUrl = finalCanvas.toDataURL('image/png');

    // Summary description of edits
    const edits = [];
    if (rotation !== 0) edits.push(`Rotated ${rotation}°`);
    if (flipH || flipV) edits.push('Flipped');
    if (crop.width < 98 || crop.height < 98 || crop.x > 2 || crop.y > 2) edits.push('Cropped');
    if (scale !== 1.0) edits.push(`Resized (${Math.round(scale * 100)}%)`);
    if (brightness !== 100 || contrast !== 100 || grayscale) edits.push('Enhanced');

    const editSummary = edits.length > 0 ? edits.join(' • ') : 'Adjusted Document';

    onSave({
      ...item,
      fileUrl: editedDataUrl,
      previewUrl: editedDataUrl,
      isEdited: true,
      editSummary,
      editState: {
        rotation, flipH, flipV, scale, brightness, contrast, grayscale, crop
      }
    });

    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                Document Studio Editor
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  {item.fileName}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Interactive Crop, Resize, Rotation & Contrast Enhancer for High-Quality Printing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700"
              title="Reset all modifications"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0 overflow-hidden">
          
          {/* Main Visual Canvas Area (Cols 7 on Desktop) */}
          <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center relative select-none border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
            
            {/* Live Size & Resolution Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 shadow-lg">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Output: {targetWidth} × {targetHeight} px</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">Scale: {Math.round(scale * 100)}%</span>
            </div>

            {/* Canvas Container with Interactive Crop Box */}
            <div
              ref={containerRef}
              className="relative max-w-full max-h-[55vh] lg:max-h-[68vh] flex items-center justify-center rounded-2xl p-2 bg-slate-900/40 border border-slate-800 shadow-2xl"
            >
              {/* Preview Canvas */}
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-[50vh] lg:max-h-[62vh] rounded-lg object-contain shadow-2xl"
              />

              {/* Interactive Crop Selection Overlay (Only active when in 'crop' tab or visible) */}
              {activeTab === 'crop' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    padding: '8px'
                  }}
                >
                  {/* Dimmed Background Shading Outside Crop */}
                  <div
                    className="absolute border-2 border-indigo-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-auto cursor-move transition-shadow"
                    style={{
                      left: `${crop.x}%`,
                      top: `${crop.y}%`,
                      width: `${crop.width}%`,
                      height: `${crop.height}%`,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                  >
                    {/* Grid Guide Lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                      <div className="border-r border-b border-indigo-300/60"></div>
                      <div className="border-r border-b border-indigo-300/60"></div>
                      <div className="border-b border-indigo-300/60"></div>
                      <div className="border-r border-b border-indigo-300/60"></div>
                      <div className="border-r border-b border-indigo-300/60"></div>
                      <div className="border-b border-indigo-300/60"></div>
                      <div className="border-r border-indigo-300/60"></div>
                      <div className="border-r border-indigo-300/60"></div>
                      <div></div>
                    </div>

                    {/* 8 Resizing Drag Handles */}
                    {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => {
                      const positions = {
                        nw: '-top-2 -left-2 cursor-nwse-resize',
                        n: '-top-2 left-1/2 -translate-x-1/2 cursor-ns-resize',
                        ne: '-top-2 -right-2 cursor-nesw-resize',
                        e: 'top-1/2 -right-2 -translate-y-1/2 cursor-ew-resize',
                        se: '-bottom-2 -right-2 cursor-nwse-resize',
                        s: '-bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize',
                        sw: '-bottom-2 -left-2 cursor-nesw-resize',
                        w: 'top-1/2 -left-2 -translate-y-1/2 cursor-ew-resize',
                      };
                      return (
                        <div
                          key={h}
                          className={`absolute w-4 h-4 bg-indigo-500 border-2 border-white rounded-full shadow-md z-20 hover:scale-125 transition-transform ${positions[h]}`}
                          onMouseDown={(e) => handleMouseDown(e, h)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Helper Text */}
            <p className="text-[11px] text-slate-500 mt-3 font-medium flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              <span>Drag corners or middle handles to adjust crop frame. Changes update real-time.</span>
            </p>
          </div>

          {/* Tool Control Panel Sidebar (Cols 5 on Desktop) */}
          <div className="lg:col-span-5 bg-slate-900 p-5 flex flex-col justify-between overflow-y-auto space-y-6">
            
            {/* Top Tool Navigation Tabs */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('crop')}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'crop'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Crop className="w-4 h-4" />
                  <span>Crop</span>
                </button>

                <button
                  onClick={() => setActiveTab('resize')}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'resize'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Resize</span>
                </button>

                <button
                  onClick={() => setActiveTab('rotate')}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'rotate'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Rotate</span>
                </button>

                <button
                  onClick={() => setActiveTab('enhance')}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'enhance'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Enhance</span>
                </button>
              </div>

              {/* TAB 1: CROP CONTROLS */}
              {activeTab === 'crop' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Crop Aspect Ratio Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ASPECT_RATIOS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => applyAspectRatioPreset(item.id)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                            aspectRatio === item.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Quick Selection Frames
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCrop({ x: 0, y: 0, width: 100, height: 100 })}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
                      >
                        Full Page (100%)
                      </button>
                      <button
                        onClick={() => setCrop({ x: 10, y: 10, width: 80, height: 80 })}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
                      >
                        Center Margin (80%)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESIZE & SCALE CONTROLS */}
              {activeTab === 'resize' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      <span>Scale Multiplier</span>
                      <span className="text-indigo-400 font-mono">{Math.round(scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.05"
                      value={scale}
                      onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>20% (Compact)</span>
                      <span>100% (Original)</span>
                      <span>200% (HD Zoom)</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Custom Pixel Dimensions
                      </label>
                      <button
                        onClick={() => setLockAspect(!lockAspect)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                          lockAspect
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {lockAspect ? '🔒 Aspect Locked' : '🔓 Aspect Unlocked'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={targetWidth}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={targetHeight}
                          onChange={(e) => handleHeightChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {[0.5, 0.75, 1.0, 1.25, 1.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleScaleChange(s)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                          scale === s
                            ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {Math.round(s * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ROTATE & FLIP CONTROLS */}
              {activeTab === 'rotate' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Quick Rotation
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        <RotateCcw className="w-4 h-4 text-indigo-400" />
                        <span>-90° Left</span>
                      </button>
                      <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        <RotateCw className="w-4 h-4 text-indigo-400" />
                        <span>+90° Right</span>
                      </button>
                      <button
                        onClick={() => setRotation((prev) => (prev + 180) % 360)}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        <RefreshCw className="w-4 h-4 text-indigo-400" />
                        <span>180° Flip</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                      <span>Fine Angle Tuning</span>
                      <span className="text-indigo-400 font-mono">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value) || 0)}
                      className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Mirror & Flip Options
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFlipH(!flipH)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          flipH
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        <span>Flip Horizontal</span>
                      </button>

                      <button
                        onClick={() => setFlipV(!flipV)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          flipV
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <FlipVertical className="w-4 h-4" />
                        <span>Flip Vertical</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ENHANCE & SCAN FILTERS */}
              {activeTab === 'enhance' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
                      </span>
                      <span className="text-indigo-400 font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      step="1"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-cyan-400" /> Contrast (Text Clarity)
                      </span>
                      <span className="text-indigo-400 font-mono">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="1"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setGrayscale(!grayscale)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                        grayscale
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Document B&W Scan Enhancer</span>
                      </span>
                      <span>{grayscale ? 'ENABLED' : 'OFF'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      Converts gray background noise to high-contrast monochrome for crisp, clean document printing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdits}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save & Apply Edits</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
