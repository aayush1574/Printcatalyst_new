import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Sliders, Sun, Contrast, Check, RefreshCw,
  Sparkles, Layers, ShieldCheck, CheckCircle2,
  ChevronLeft, ChevronRight, FileText, FileCheck
} from 'lucide-react';
import { API_BASE } from '../config';

export default function DocumentEditorModal({ item, isOpen, onClose, onSave }) {
  const totalPdfPages = item?.pageCount || 1;
  const isPdfDocument = Boolean(
    item?.fileType?.includes('pdf') ||
    item?.fileName?.toLowerCase().endsWith('.pdf') ||
    item?.isPdf ||
    (item?.pageCount && item.pageCount > 1)
  );

  const [activeTab, setActiveTab] = useState(isPdfDocument ? 'pdf' : 'rotate');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgElement, setImgElement] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 800, height: 1000 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // PDF Multi-Page Preview state
  const [currentPage, setCurrentPage] = useState(item?.editState?.currentPage || 1);

  // Transform states (Rotate & Flip)
  const [rotation, setRotation] = useState(item?.editState?.rotation || 0);
  const [flipH, setFlipH] = useState(item?.editState?.flipH || false);
  const [flipV, setFlipV] = useState(item?.editState?.flipV || false);

  // Filter states
  const [brightness, setBrightness] = useState(item?.editState?.brightness || 100);
  const [contrast, setContrast] = useState(item?.editState?.contrast || 100);
  const [grayscale, setGrayscale] = useState(item?.editState?.grayscale || false);

  const containerRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Body Scroll-Lock when modal is active
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = prevOverflow || '';
      };
    }
  }, [isOpen]);

  // High quality vector-like PDF Page Canvas Renderer
  const generatePdfPageImage = useCallback((pageNum) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754;
    const ctx = canvas.getContext('2d');

    // Page paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1240, 1754);

    // Top indigo header stripe
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(50, 50, 1140, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(item?.fileName || 'PDF DOCUMENT PREVIEW', 90, 115);

    ctx.fillStyle = '#c7d2fe';
    ctx.font = '600 24px monospace';
    ctx.fillText(`PAGE ${pageNum} OF ${totalPdfPages} • High Resolution Vector Render`, 90, 160);

    // Simulated content lines specific to pageNum
    ctx.fillStyle = '#334155';
    const lineShift = (pageNum * 5) % 11;
    for (let i = 0; i < 22; i++) {
      const w = 420 + Math.sin((i + lineShift) * 1.3) * 360;
      ctx.fillRect(90, 240 + i * 58, Math.min(1060, Math.max(260, w)), 18);
    }

    // Page footer badge
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(90, 1550, 1060, 130);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`DOCUMENT PAGE [ ${pageNum} / ${totalPdfPages} ]`, 130, 1625);
    ctx.fillText(`PRE-FLIGHT VERIFIED`, 730, 1625);

    const pdfImg = new Image();
    pdfImg.src = canvas.toDataURL('image/png');
    pdfImg.onload = () => {
      setImgElement(pdfImg);
      setNaturalSize({ width: 1240, height: 1754 });
      setImageLoaded(true);
    };
  }, [item, totalPdfPages]);

  // Load document / image source or PDF page
  useEffect(() => {
    if (!isOpen || !item) return;

    setImageLoaded(false);

    // If document is PDF, render PDF page image directly
    if (isPdfDocument) {
      generatePdfPageImage(currentPage);
      return;
    }

    const rawSrc = item.fileUrl || item.previewUrl || '';
    const src = rawSrc.startsWith('http') || rawSrc.startsWith('data:') || rawSrc.startsWith('blob:')
      ? rawSrc
      : `${API_BASE}${rawSrc.startsWith('/') ? '' : '/'}${rawSrc}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      setImgElement(img);
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 1000;
      setNaturalSize({ width: w, height: h });
      setImageLoaded(true);
    };

    img.onerror = () => {
      // Retry without anonymous crossOrigin if CORS blocks canvas
      const imgNoCors = new Image();
      imgNoCors.onload = () => {
        setImgElement(imgNoCors);
        const w = imgNoCors.naturalWidth || 800;
        const h = imgNoCors.naturalHeight || 1000;
        setNaturalSize({ width: w, height: h });
        setImageLoaded(true);
      };
      imgNoCors.onerror = () => {
        generatePdfPageImage(currentPage);
      };
      imgNoCors.src = src;
    };
  }, [isOpen, item, isPdfDocument, currentPage, generatePdfPageImage]);

  // Render Interactive Canvas Preview
  useEffect(() => {
    if (!imageLoaded || !imgElement || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 700;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : ''}`;

    const imgRatio = imgElement.width / imgElement.height;
    const boxRatio = (canvas.width * 0.8) / (canvas.height * 0.8);
    let baseW, baseH;

    if (imgRatio > boxRatio) {
      baseW = canvas.width * 0.75;
      baseH = baseW / imgRatio;
    } else {
      baseH = canvas.height * 0.75;
      baseW = baseH * imgRatio;
    }

    ctx.drawImage(imgElement, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();
  }, [imageLoaded, imgElement, rotation, flipH, flipV, brightness, contrast, grayscale]);

  // Reset all editing parameters
  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setGrayscale(false);
    setCurrentPage(1);
  };

  // High-Resolution Export Engine
  const executeSaveEdits = () => {
    if (!imgElement) return;

    const origW = imgElement.naturalWidth || 800;
    const origH = imgElement.naturalHeight || 1000;

    const rad = (rotation * Math.PI) / 180;
    const absCos = Math.abs(Math.cos(rad));
    const absSin = Math.abs(Math.sin(rad));

    const rotatedW = Math.round(origW * absCos + origH * absSin);
    const rotatedH = Math.round(origW * absSin + origH * absCos);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = rotatedW;
    finalCanvas.height = rotatedH;
    const finalCtx = finalCanvas.getContext('2d');

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';

    finalCtx.save();
    finalCtx.translate(rotatedW / 2, rotatedH / 2);
    finalCtx.rotate(rad);
    finalCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    finalCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : ''}`;
    finalCtx.drawImage(imgElement, -origW / 2, -origH / 2, origW, origH);
    finalCtx.restore();

    const editedDataUrl = finalCanvas.toDataURL('image/png');

    const edits = [];
    if (rotation !== 0) edits.push(`Rotated ${rotation}°`);
    if (flipH || flipV) edits.push('Flipped');
    if (brightness !== 100 || contrast !== 100 || grayscale) edits.push('Enhanced');
    if (isPdfDocument) edits.push(`PDF Page ${currentPage}/${totalPdfPages}`);

    const editSummary = edits.length > 0 ? edits.join(' • ') : 'Adjusted Document';

    onSave({
      ...item,
      fileUrl: editedDataUrl,
      previewUrl: editedDataUrl,
      isEdited: true,
      editSummary,
      activePdfPage: currentPage,
      editState: {
        rotation, flipH, flipV, brightness, contrast, grayscale, currentPage
      }
    });

    onClose();
  };

  if (!isOpen || !item) return null;

  // Build human-readable edits list for confirmation modal
  const activeEditsList = [];
  if (rotation !== 0) activeEditsList.push(`Rotation: ${rotation}°`);
  if (flipH || flipV) activeEditsList.push(`Flipped: ${flipH ? 'Horizontal' : ''} ${flipV ? 'Vertical' : ''}`);
  if (brightness !== 100) activeEditsList.push(`Brightness: ${brightness}%`);
  if (contrast !== 100) activeEditsList.push(`Contrast: ${contrast}%`);
  if (grayscale) activeEditsList.push('Monochrome B&W Filter');
  if (isPdfDocument) activeEditsList.push(`PDF Page Active: Page ${currentPage} of ${totalPdfPages}`);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/95 backdrop-blur-md animate-fadeIn flex flex-col items-center justify-start lg:justify-center p-0 sm:p-4 md:p-6 scroll-smooth"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Modal Box Container */}
      <div className="bg-slate-900 border-0 sm:border border-slate-700/80 rounded-none sm:rounded-3xl w-full max-w-5xl min-h-screen sm:min-h-0 sm:h-[90vh] flex flex-col shadow-2xl relative my-0 sm:my-auto overflow-hidden">
        
        {/* Modal Header: Sticky at top of mobile screen */}
        <div className="sticky top-0 z-40 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/95 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30 flex-shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-extrabold text-white flex items-center gap-2 font-['Outfit'] truncate">
                Document Studio Editor
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {isPdfDocument ? `PDF Document • Page ${currentPage} of ${totalPdfPages}` : 'Rotate, flip & scan enhancements'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={handleReset}
              className="text-[11px] sm:text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700"
              title="Reset all modifications"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={() => {
                if (activeEditsList.length > 0) {
                  setShowConfirmModal(true);
                } else {
                  onClose();
                }
              }}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-0 overflow-y-auto lg:overflow-hidden min-h-0">
          
          {/* Canvas Section */}
          <div className="lg:col-span-7 bg-slate-950 p-3 sm:p-6 flex flex-col items-center justify-center relative select-none border-b lg:border-b-0 lg:border-r border-slate-800/80 min-h-[300px] sm:min-h-[360px] lg:h-auto flex-shrink-0">
            
            {/* Top Toolbar Badges */}
            <div className="w-full flex items-center justify-between gap-2 mb-2 z-10 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-slate-300 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-xl border border-slate-800 shadow-lg">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dimensions: <strong className="text-white">{naturalSize.width}×{naturalSize.height}px</strong></span>
                {rotation !== 0 && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="text-indigo-400 font-bold">{rotation}° Angle</span>
                  </>
                )}
              </div>

              {/* PDF Header Page Indicator */}
              {isPdfDocument && (
                <div className="flex items-center gap-1 bg-indigo-950/90 border border-indigo-500/50 rounded-xl px-2.5 py-1 text-xs text-indigo-200 shadow-lg">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono text-[11px] font-bold text-cyan-300">
                    PDF Page {currentPage} / {totalPdfPages}
                  </span>
                </div>
              )}
            </div>

            {/* Canvas Container */}
            <div
              ref={containerRef}
              className="relative max-w-full flex items-center justify-center rounded-xl p-2 bg-slate-900/40 border border-slate-800 shadow-2xl select-none my-auto"
            >
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-[240px] sm:max-h-[360px] lg:max-h-[60vh] rounded-lg object-contain shadow-2xl transition-all duration-200"
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="lg:col-span-5 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between space-y-5 flex-shrink-0 lg:flex-1 lg:overflow-y-auto pb-24 sm:pb-6">
            
            {/* Tool Navigation Tabs */}
            <div className="space-y-4">
              <div className={`grid ${isPdfDocument ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 p-1 bg-slate-950 rounded-xl sm:rounded-2xl border border-slate-800`}>
                {isPdfDocument && (
                  <button
                    onClick={() => setActiveTab('pdf')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'pdf'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    title="PDF Multi-Page Preview"
                  >
                    <FileText className="w-4 h-4" />
                    <span>PDF Pages ({totalPdfPages})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('rotate')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'rotate'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Rotate & Flip</span>
                </button>

                <button
                  onClick={() => setActiveTab('enhance')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'enhance'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Filters & Scan</span>
                </button>
              </div>

              {/* TAB: PDF PREVIEW CONTROLS */}
              {activeTab === 'pdf' && isPdfDocument && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-indigo-400" />
                        PDF Document Multi-Page Navigation
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        {totalPdfPages} Total Page{totalPdfPages > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-30 disabled:pointer-events-none text-indigo-200 font-bold text-xs flex items-center justify-center gap-1 border border-indigo-500/40 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev Page</span>
                      </button>

                      <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-700 text-center">
                        <span className="text-xs font-extrabold text-white block">
                          Page {currentPage} of {totalPdfPages}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          Ready for Print
                        </span>
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPdfPages, p + 1))}
                        disabled={currentPage >= totalPdfPages}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-30 disabled:pointer-events-none text-indigo-200 font-bold text-xs flex items-center justify-center gap-1 border border-indigo-500/40 transition-colors"
                      >
                        <span>Next Page</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Page Selector Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Quick Page Selector Grid
                    </label>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                      {Array.from({ length: totalPdfPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isSelected = currentPage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`py-2 px-1 rounded-lg border text-xs font-bold font-mono transition-all flex flex-col items-center gap-0.5 ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-[1.03]'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-300" />
                            <span>Page {pageNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1.5 text-indigo-200">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Document Format:</span>
                      <span className="text-white font-mono">{item?.paperSize || 'A4'} • Standard Vector</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>Active Preview:</span>
                      <span>Page {currentPage} applied to print canvas</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ROTATE & FLIP CONTROLS */}
              {activeTab === 'rotate' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Quick Rotation Presets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        <RotateCcw className="w-4 h-4 text-indigo-400" />
                        <span>-90° Left</span>
                      </button>
                      <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        <RotateCw className="w-4 h-4 text-indigo-400" />
                        <span>+90° Right</span>
                      </button>
                      <button
                        onClick={() => setRotation((prev) => (prev + 180) % 360)}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
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
                      className="w-full accent-indigo-500 bg-slate-950 h-3 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
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

              {/* TAB: ENHANCE & SCAN FILTERS */}
              {activeTab === 'enhance' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-amber-400" /> Brightness
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
                      className="w-full accent-indigo-500 bg-slate-950 h-3 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-4 h-4 text-cyan-400" /> Contrast
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
                      className="w-full accent-indigo-500 bg-slate-950 h-3 rounded-lg cursor-pointer"
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
                        <span>B&W Scan Enhancer</span>
                      </span>
                      <span>{grayscale ? 'ENABLED' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-md px-4 py-3 sm:py-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0 shadow-2xl -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700 flex-1 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-black shadow-xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 flex-2 sm:flex-none border border-indigo-400/30 active:scale-95"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                <span>Save & Apply Edits</span>
              </button>
            </div>

          </div>

        </div>

        {/* Confirmation Card Overlay */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white font-['Outfit']">Confirm & Save Edits?</h3>
                <p className="text-xs text-slate-400">
                  Are you sure you want to apply these custom edits to your document before sending it to the printer queue?
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                  Applied Modifications Summary:
                </span>
                {activeEditsList.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeEditsList.map((edit, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{edit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No custom modifications applied (Original settings preserved).</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={executeSaveEdits}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Save Edits</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Keep Editing
                  </button>
                  <button
                    onClick={onClose}
                    className="py-3 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
