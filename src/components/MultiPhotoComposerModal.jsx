import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, ImagePlus, LayoutGrid, Rows, Columns, Trash2,
  Printer, CheckCircle, Sparkles, ZoomIn, Settings2,
  LayoutTemplate, Grid, Maximize2
} from 'lucide-react';

// Paper dimensions in mm (width × height, portrait)
const PAPER_SIZES = {
  A4:       { w: 210, h: 297, label: 'A4 (210 × 297 mm)' },
  A3:       { w: 297, h: 420, label: 'A3 (297 × 420 mm)' },
  Legal:    { w: 216, h: 356, label: 'Legal (216 × 356 mm)' },
  Photo_4x6:{ w: 102, h: 152, label: 'Photo 4×6″ (102 × 152 mm)' },
};

const MARGIN_OPTIONS = [
  { value: 5,  label: '5 mm (Minimal)' },
  { value: 10, label: '10 mm (Standard)' },
  { value: 15, label: '15 mm (Wide)' },
];

const LAYOUTS = [
  { id: 'side-by-side', label: 'Side by Side', icon: Columns,        desc: 'Photos in a horizontal row' },
  { id: 'stacked',      label: 'Stacked',      icon: Rows,           desc: 'Photos in a vertical column' },
  { id: 'grid',         label: 'Adaptive Grid',icon: LayoutGrid,     desc: 'Smart balanced grid' },
  { id: 'featured',     label: 'Hero Featured',icon: LayoutTemplate, desc: 'Large hero photo with sub-row' },
  { id: '2-columns',    label: '2 Columns',    icon: Grid,           desc: 'Fixed 2-column layout' },
  { id: '3-columns',    label: '3 Columns',    icon: Maximize2,      desc: 'Fixed 3-column layout' },
];

/**
 * Fit an image (imgW × imgH) inside a box (boxW × boxH) preserving aspect ratio.
 * Returns { x, y, w, h } for drawing position.
 */
function fitContain(imgW, imgH, boxW, boxH) {
  const imgRatio = imgW / imgH;
  const boxRatio = boxW / boxH;
  let w, h;
  if (imgRatio > boxRatio) {
    w = boxW;
    h = boxW / imgRatio;
  } else {
    h = boxH;
    w = boxH * imgRatio;
  }
  return {
    x: (boxW - w) / 2,
    y: (boxH - h) / 2,
    w,
    h,
  };
}

/**
 * Calculate cell positions for each photo based on layout.
 * Returns array of { x, y, w, h } in mm (relative to printable area origin).
 */
function computeCells(layout, count, areaW, areaH, gap) {
  const cells = [];
  if (count === 0) return cells;

  if (layout === 'side-by-side') {
    const cellW = (areaW - gap * (count - 1)) / count;
    for (let i = 0; i < count; i++) {
      cells.push({ x: i * (cellW + gap), y: 0, w: cellW, h: areaH });
    }
  } else if (layout === 'stacked') {
    const cellH = (areaH - gap * (count - 1)) / count;
    for (let i = 0; i < count; i++) {
      cells.push({ x: 0, y: i * (cellH + gap), w: areaW, h: cellH });
    }
  } else if (layout === 'featured') {
    if (count === 1) {
      cells.push({ x: 0, y: 0, w: areaW, h: areaH });
    } else {
      const heroH = (areaH - gap) * 0.58;
      const subH = (areaH - gap) * 0.42;
      cells.push({ x: 0, y: 0, w: areaW, h: heroH });
      const subCount = count - 1;
      const subW = (areaW - gap * (subCount - 1)) / subCount;
      for (let i = 0; i < subCount; i++) {
        cells.push({ x: i * (subW + gap), y: heroH + gap, w: subW, h: subH });
      }
    }
  } else if (layout === '2-columns') {
    const cols = 2;
    const rows = Math.ceil(count / cols);
    const cellW = (areaW - gap) / cols;
    const cellH = (areaH - gap * (rows - 1)) / rows;
    for (let i = 0; i < count; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const isLastOdd = (i === count - 1) && (count % 2 === 1);
      const x = isLastOdd ? (areaW - cellW) / 2 : c * (cellW + gap);
      const y = r * (cellH + gap);
      cells.push({ x, y, w: cellW, h: cellH });
    }
  } else if (layout === '3-columns') {
    const cols = 3;
    const rows = Math.ceil(count / cols);
    const cellW = (areaW - gap * (cols - 1)) / cols;
    const cellH = (areaH - gap * (rows - 1)) / rows;
    const itemsInLastRow = count % cols || cols;
    const lastRowIndex = rows - 1;
    for (let i = 0; i < count; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      let x = c * (cellW + gap);
      if (r === lastRowIndex && itemsInLastRow < cols) {
        const lastRowWidth = itemsInLastRow * cellW + (itemsInLastRow - 1) * gap;
        const startX = (areaW - lastRowWidth) / 2;
        x = startX + (i % itemsInLastRow) * (cellW + gap);
      }
      const y = r * (cellH + gap);
      cells.push({ x, y, w: cellW, h: cellH });
    }
  } else {
    // Adaptive Grid layout for up to 6 photos
    if (count <= 2) {
      const cellW = (areaW - gap * (count - 1)) / count;
      for (let i = 0; i < count; i++) {
        cells.push({ x: i * (cellW + gap), y: 0, w: cellW, h: areaH });
      }
    } else if (count === 3 || count === 4) {
      const cols = 2;
      const rows = 2;
      const cellW = (areaW - gap) / cols;
      const cellH = (areaH - gap) / rows;
      if (count === 4) {
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 2; c++) {
            cells.push({ x: c * (cellW + gap), y: r * (cellH + gap), w: cellW, h: cellH });
          }
        }
      } else {
        // 3 photos: 2 top, 1 bottom centered
        for (let c = 0; c < 2; c++) {
          cells.push({ x: c * (cellW + gap), y: 0, w: cellW, h: cellH });
        }
        const bottomX = (areaW - cellW) / 2;
        cells.push({ x: bottomX, y: cellH + gap, w: cellW, h: cellH });
      }
    } else if (count === 5 || count === 6) {
      const cols = 3;
      const rows = 2;
      const cellW = (areaW - gap * 2) / cols;
      const cellH = (areaH - gap) / rows;
      if (count === 6) {
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3; c++) {
            cells.push({ x: c * (cellW + gap), y: r * (cellH + gap), w: cellW, h: cellH });
          }
        }
      } else {
        // 5 photos: 3 top, 2 bottom centered
        for (let c = 0; c < 3; c++) {
          cells.push({ x: c * (cellW + gap), y: 0, w: cellW, h: cellH });
        }
        const bottomRowW = 2 * cellW + gap;
        const startX = (areaW - bottomRowW) / 2;
        for (let c = 0; c < 2; c++) {
          cells.push({ x: startX + c * (cellW + gap), y: cellH + gap, w: cellW, h: cellH });
        }
      }
    }
  }
  return cells;
}

export default function MultiPhotoComposerModal({ isOpen, onClose, onAddComposedItem }) {
  // Photos: array of { id, file, name, objectUrl, img (HTMLImageElement) }
  const [photos, setPhotos] = useState([]);
  const [layout, setLayout] = useState('side-by-side');
  const [paperSize, setPaperSize] = useState('A4');
  const [margin, setMargin] = useState(10);
  const [colorMode, setColorMode] = useState('COLOR');
  const [copies, setCopies] = useState(1);
  const [paperType, setPaperType] = useState('glossy_180gsm');
  const [finishing, setFinishing] = useState('none');
  const [composing, setComposing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Canvas rendering constants
  const CANVAS_MAX_W = 480;
  const GAP_MM = 4; // gap between photos in mm

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.objectUrl) URL.revokeObjectURL(p.objectUrl);
      });
    };
  }, []);

  // Draw preview whenever relevant state changes
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const paper = PAPER_SIZES[paperSize];
    const scale = CANVAS_MAX_W / paper.w;
    const cw = Math.round(paper.w * scale);
    const ch = Math.round(paper.h * scale);

    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    // Background (dark surround)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, cw, ch);

    // Paper
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillRect(0, 0, cw, ch);
    ctx.shadowColor = 'transparent';

    // Margin guide lines (dashed)
    const mx = margin * scale;
    const my = margin * scale;
    const pw = cw - 2 * mx;
    const ph = ch - 2 * my;

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx, my, pw, ph);
    ctx.setLineDash([]);

    if (photos.length === 0) {
      // Empty state text
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${Math.round(13 * scale)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add photos to preview', cw / 2, ch / 2 - 10 * scale);
      ctx.font = `${Math.round(9 * scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#64748b';
      ctx.fillText('2–6 images supported', cw / 2, ch / 2 + 10 * scale);
      return;
    }

    // Compute cells
    const areaW = paper.w - 2 * margin;
    const areaH = paper.h - 2 * margin;
    const cells = computeCells(layout, photos.length, areaW, areaH, GAP_MM);

    // Draw each photo
    photos.forEach((photo, idx) => {
      if (idx >= cells.length) return;
      const cell = cells[idx];

      // Cell position in canvas pixels
      const cx = mx + cell.x * scale;
      const cy = my + cell.y * scale;
      const cellW = cell.w * scale;
      const cellH = cell.h * scale;

      // Cell background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(cx, cy, cellW, cellH);

      // Draw image if loaded
      if (photo.img && photo.img.complete && photo.img.naturalWidth > 0) {
        const fit = fitContain(photo.img.naturalWidth, photo.img.naturalHeight, cellW, cellH);

        // Apply grayscale filter if B&W mode
        if (colorMode === 'BLACK_AND_WHITE') {
          ctx.filter = 'grayscale(100%) contrast(110%)';
        }

        ctx.drawImage(photo.img, cx + fit.x, cy + fit.y, fit.w, fit.h);
        ctx.filter = 'none';
      } else {
        // Placeholder
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `${Math.round(10 * scale)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading...', cx + cellW / 2, cy + cellH / 2);
      }

      // Cell border
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, cellW, cellH);
    });

    // Paper border
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, cw - 1, ch - 1);

    // Paper size label at bottom
    ctx.fillStyle = 'rgba(100, 116, 139, 0.7)';
    ctx.font = `${Math.round(8 * scale)}px "JetBrains Mono", monospace, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${paper.label} · ${margin}mm margins · ${photos.length} photo(s)`, cw / 2, ch - 4 * scale);
  }, [photos, layout, paperSize, margin, colorMode]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  if (!isOpen) return null;

  // Handle file add
  const handleAddPhotos = (fileList) => {
    if (!fileList) return;
    const remaining = 6 - photos.length;
    if (remaining <= 0) return;

    const newFiles = Array.from(fileList).slice(0, remaining);
    const newPhotos = newFiles
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => {
        const objectUrl = URL.createObjectURL(f);
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => drawPreview();
        return {
          id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          file: f,
          name: f.name,
          objectUrl,
          img,
        };
      });

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.objectUrl) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  // Compose and submit
  const handleCompose = async (autoSubmit = false) => {
    if (photos.length < 1) {
      alert('Please add at least 1 photo.');
      return;
    }
    setComposing(true);

    try {
      // Render at high resolution (300 DPI equivalent)
      const paper = PAPER_SIZES[paperSize];
      const DPI_SCALE = 300 / 25.4; // pixels per mm at 300 DPI
      const hiResW = Math.round(paper.w * DPI_SCALE);
      const hiResH = Math.round(paper.h * DPI_SCALE);

      const offscreen = document.createElement('canvas');
      offscreen.width = hiResW;
      offscreen.height = hiResH;
      const ctx = offscreen.getContext('2d');

      // White paper
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, hiResW, hiResH);

      const scale = DPI_SCALE;
      const mx = margin * scale;
      const my = margin * scale;
      const areaW = paper.w - 2 * margin;
      const areaH = paper.h - 2 * margin;
      const cells = computeCells(layout, photos.length, areaW, areaH, GAP_MM);

      photos.forEach((photo, idx) => {
        if (idx >= cells.length || !photo.img) return;
        const cell = cells[idx];
        const cx = mx + cell.x * scale;
        const cy = my + cell.y * scale;
        const cellW = cell.w * scale;
        const cellH = cell.h * scale;

        if (colorMode === 'BLACK_AND_WHITE') {
          ctx.filter = 'grayscale(100%) contrast(110%)';
        }

        if (photo.img.complete && photo.img.naturalWidth > 0) {
          const fit = fitContain(photo.img.naturalWidth, photo.img.naturalHeight, cellW, cellH);
          ctx.drawImage(photo.img, cx + fit.x, cy + fit.y, fit.w, fit.h);
        }
        ctx.filter = 'none';
      });

      const dataUrl = offscreen.toDataURL('image/png', 0.92);

      onAddComposedItem({
        id: 'composed_' + Date.now(),
        fileName: `MultiPhoto_${photos.length}up_${paperSize}.png`,
        fileSize: `${(dataUrl.length / (1024 * 1024)).toFixed(2)} MB`,
        fileUrl: dataUrl,
        fileType: 'image/png',
        pageCount: 1,
        copies,
        colorMode,
        duplex: 'SINGLE_SIDED',
        paperSize,
        paperType,
        pageRange: 'ALL',
        orientation: 'PORTRAIT',
        finishing,
        isComposedMultiPhoto: true,
      }, autoSubmit);

      // Cleanup
      photos.forEach((p) => {
        if (p.objectUrl) URL.revokeObjectURL(p.objectUrl);
      });
      setPhotos([]);
      setLayout('side-by-side');
      onClose();
    } catch (err) {
      console.error('Compose error:', err);
      alert('Failed to compose photos. Please try again.');
    } finally {
      setComposing(false);
    }
  };

  const handleReset = () => {
    photos.forEach((p) => {
      if (p.objectUrl) URL.revokeObjectURL(p.objectUrl);
    });
    setPhotos([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0">
              <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2">
                Multiple Photos on One Page
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-semibold border border-violet-500/20">
                  COMPOSER
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Select 2–6 photos · Choose a layout · Auto-fitted to paper
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-y-auto lg:overflow-hidden min-h-0">

          {/* Left Controls Panel (2/5) */}
          <div className="lg:col-span-2 flex flex-col lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800/60 bg-slate-950/50">
            <div className="p-3.5 sm:p-4 space-y-3.5 sm:space-y-4">

              {/* ── Photo Upload Zone ── */}
              <div className="space-y-2">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImagePlus className="w-3.5 h-3.5 text-violet-400" />
                  Photos ({photos.length}/6)
                </h4>

                {/* Thumbnails */}
                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700 group shadow-md"
                      >
                        <img
                          src={p.objectUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemovePhoto(p.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 truncate px-1">
                          {p.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone (show only if < 6 photos) */}
                {photos.length < 6 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleAddPhotos(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3.5 sm:p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-violet-400 bg-violet-950/30 scale-[1.01]'
                        : 'border-slate-700 hover:border-violet-500/60 bg-slate-900/40'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => {
                        handleAddPhotos(e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <ImagePlus className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1.5 text-violet-400/70" />
                    <p className="text-xs font-semibold text-slate-300">
                      {photos.length === 0 ? 'Add photos (2–6)' : `Add ${6 - photos.length} more`}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP</p>
                  </div>
                )}

                {photos.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>

              {/* ── Layout Selector ── */}
              <div className="space-y-2">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-violet-400" />
                  Page Layout
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLayout(l.id)}
                      className={`flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-xl border text-[10px] font-semibold transition-all ${
                        layout === l.id
                          ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 shadow-md shadow-violet-600/10'
                          : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <l.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="truncate w-full text-center">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Paper & Margins ── */}
              <div className="space-y-2">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-violet-400" />
                  Paper & Margins
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">Paper Size</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value)}
                      className="w-full px-2 py-1.5 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:border-violet-500 focus:outline-none"
                    >
                      {Object.entries(PAPER_SIZES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">Margins</label>
                    <select
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full px-2 py-1.5 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:border-violet-500 focus:outline-none"
                    >
                      {MARGIN_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Print Options ── */}
              <div className="space-y-2">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-violet-400" />
                  Print Options
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">Color Mode</label>
                    <select
                      value={colorMode}
                      onChange={(e) => setColorMode(e.target.value)}
                      className="w-full px-2 py-1.5 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:border-violet-500 focus:outline-none"
                    >
                      <option value="COLOR">Full Color</option>
                      <option value="BLACK_AND_WHITE">Black & White</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">Copies</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1.5 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">Paper Quality</label>
                    <select
                      value={paperType}
                      onChange={(e) => setPaperType(e.target.value)}
                      className="w-full px-2 py-1.5 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:border-violet-500 focus:outline-none"
                    >
                      <option value="standard_75gsm">Standard 75 GSM</option>
                      <option value="bond_85gsm">Executive Bond 85 GSM</option>
                      <option value="glossy_180gsm">Glossy Photo 180 GSM</option>
                      <option value="cardstock_250gsm">Heavy Cardstock 250 GSM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-medium">Finishing</label>
                    <select
                      value={finishing}
                      onChange={(e) => setFinishing(e.target.value)}
                      className="w-full px-2 py-1.5 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] focus:border-violet-500 focus:outline-none"
                    >
                      <option value="none">No Finishing</option>
                      <option value="lamination_a4">Lamination</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="mt-auto border-t border-slate-800/60 p-3.5 sm:p-4 space-y-2 bg-slate-950/70 flex-shrink-0">
              {photos.length > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium px-1 pb-1">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{photos.length} Photo{photos.length > 1 ? 's' : ''} Ready ({paperSize})</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{copies} Copy({copies > 1 ? 'ies' : ''})</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCompose(true)}
                  disabled={photos.length < 1 || composing}
                  className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 border border-indigo-400/30"
                >
                  {composing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Composing...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 text-cyan-300" />
                      <span>Print Order Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCompose(false)}
                  disabled={photos.length < 1 || composing}
                  className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-600 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <CheckCircle className="w-4 h-4 text-violet-400" />
                  <span>Add to Order</span>
                </button>
              </div>

              {photos.length === 0 && (
                <p className="text-[10px] text-amber-400/80 text-center font-medium">
                  Select 1–6 photos above to enable print order options
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Live Canvas Preview (3/5) ── */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center bg-slate-950 p-3.5 sm:p-6 lg:overflow-y-auto min-h-[260px] sm:min-h-[300px]">
            <div className="space-y-2.5 sm:space-y-3 w-full flex flex-col items-center">

              {/* Preview header */}
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-400">
                <ZoomIn className="w-3.5 h-3.5 text-violet-400" />
                <span>Live Page Preview</span>
                <span className="text-slate-600">·</span>
                <span className="text-violet-300 font-mono">{PAPER_SIZES[paperSize].label}</span>
              </div>

              {/* Canvas */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 w-full flex justify-center max-w-[340px] sm:max-w-[480px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto block"
                  style={{ background: '#0f172a' }}
                />

                {/* Floating layout label */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-[9px] text-slate-300 font-semibold backdrop-blur-sm border border-white/10">
                  {LAYOUTS.find(l => l.id === layout)?.label} · {photos.length} Photo{photos.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Info chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px]">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium">
                  {paperSize} · {margin}mm margins
                </span>
                <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium border ${
                  colorMode === 'COLOR'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                }`}>
                  {colorMode === 'COLOR' ? 'Full Color' : 'B&W'}
                </span>
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium">
                  {copies} {copies === 1 ? 'Copy' : 'Copies'}
                </span>
              </div>

              {/* Aspect ratio note */}
              <p className="text-[9px] sm:text-[10px] text-slate-500 text-center max-w-sm px-2">
                <Sparkles className="w-3 h-3 inline mr-1 text-violet-400/60" />
                Photos are automatically fitted within cells while preserving original aspect ratios. No cropping or distortion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
