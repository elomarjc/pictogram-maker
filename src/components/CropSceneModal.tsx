import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, Crop, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

export interface CropSceneResult {
  dataUrl: string;
  name: string;
  originalUrl: string;
}

interface CropSceneModalProps {
  isOpen: boolean;
  imageSource: string | null;
  initialName?: string;
  onClose: () => void;
  onSave: (result: CropSceneResult) => void;
}

export const CropSceneModal: React.FC<CropSceneModalProps> = ({
  isOpen,
  imageSource,
  initialName = '',
  onClose,
  onSave,
}) => {
  const [sceneName, setSceneName] = useState(initialName);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [zoom, setZoom] = useState(1);
  const [offsetY, setOffsetY] = useState(0); // in percent (-50 to 50)
  const [offsetX, setOffsetX] = useState(0); // in percent (-50 to 50)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSceneName(initialName || 'Min scene');
      setFitMode('cover');
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    }
  }, [isOpen, initialName, imageSource]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (fitMode !== 'cover') return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: offsetX,
      startY: offsetY,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Map pixels to percentage offset
    setOffsetX(Math.max(-50, Math.min(50, dragStartRef.current.startX + dx * 0.25)));
    setOffsetY(Math.max(-50, Math.min(50, dragStartRef.current.startY + dy * 0.25)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
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

  if (!isOpen || !imageSource) return null;

  const handleApplyCrop = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 16:9 canvas matching pictogram card scene box proportions
      const targetW = 640;
      const targetH = 360;
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clean background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);

      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;

      if (fitMode === 'contain') {
        // Fit entire image inside box without any clipping
        const scale = Math.min(targetW / srcW, targetH / srcH) * zoom;
        const renderW = srcW * scale;
        const renderH = srcH * scale;
        const renderX = (targetW - renderW) / 2 + (offsetX / 100) * targetW;
        const renderY = (targetH - renderH) / 2 + (offsetY / 100) * targetH;

        ctx.drawImage(img, renderX, renderY, renderW, renderH);
      } else {
        // Cover box with interactive zoom and pan
        const baseScale = Math.max(targetW / srcW, targetH / srcH);
        const scale = baseScale * zoom;
        const renderW = srcW * scale;
        const renderH = srcH * scale;

        // Centered base plus percentage offset
        const centerX = (targetW - renderW) / 2;
        const centerY = (targetH - renderH) / 2;
        const panPixelX = (offsetX / 100) * (renderW - targetW);
        const panPixelY = (offsetY / 100) * (renderH - targetH);

        const renderX = centerX + panPixelX;
        const renderY = centerY + panPixelY;

        ctx.drawImage(img, renderX, renderY, renderW, renderH);
      }

      const croppedDataUrl = canvas.toDataURL('image/png', 0.95);
      onSave({
        dataUrl: croppedDataUrl,
        name: sceneName.trim() || 'Min scene',
        originalUrl: imageSource,
      });
      onClose();
    };
    img.src = imageSource;
  };

  const handleReset = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs">
              <Crop size={17} />
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">
              Tilpas og navngiv scene
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Scene Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-900 flex items-center justify-between">
              <span>Scenens navn *</span>
              <span className="text-[11px] text-slate-500 font-semibold">Vises i oversigten</span>
            </label>
            <input
              type="text"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              placeholder="f.eks. Gåtur med hunden, Jacob, Frokost..."
              className="w-full px-3 py-2 rounded-xl border-2 border-slate-900 focus:border-amber-500 font-bold text-xs text-slate-900 outline-hidden bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setFitMode('cover');
                handleReset();
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                fitMode === 'cover'
                  ? 'bg-white text-slate-900 border-2 border-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Maximize2 size={13} />
              <span>Beskær & Udfyld (Crop)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFitMode('contain');
                handleReset();
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                fitMode === 'contain'
                  ? 'bg-white text-slate-900 border-2 border-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minimize2 size={13} />
              <span>Tilpas hele billedet (Fit)</span>
            </button>
          </div>

          {/* Preview Box - Exact 16:9 ratio of card scene box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-0.5">
              <span>Forhåndsvisning i kassen:</span>
              {fitMode === 'cover' && (
                <span className="text-amber-800 font-bold">Træk eller brug skydere for at flytte</span>
              )}
            </div>

            <div
              onMouseDown={handleMouseDown}
              className={`w-full aspect-[16/9] rounded-2xl border-3 border-slate-900 overflow-hidden relative shadow-md bg-white select-none ${
                fitMode === 'cover' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
            >
              <img
                src={imageSource}
                alt="Forhåndsvisning"
                draggable={false}
                style={{
                  transform:
                    fitMode === 'cover'
                      ? `scale(${zoom}) translate(${offsetX}%, ${offsetY}%)`
                      : `scale(${zoom}) translate(${offsetX}%, ${offsetY}%)`,
                  transformOrigin: 'center center',
                }}
                className={`w-full h-full pointer-events-none transition-transform duration-75 ${
                  fitMode === 'cover' ? 'object-cover object-center' : 'object-contain object-center'
                }`}
              />

              {/* Aspect ratio frame guide */}
              <div className="absolute inset-0 pointer-events-none border border-slate-900/10 rounded-xl" />
            </div>
          </div>

          {/* Adjustment Sliders */}
          <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2.5">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 w-16 shrink-0">Størrelse:</span>
              <input
                type="range"
                min="0.6"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-black text-slate-900 w-10 text-right tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Vertical Position Slider (vital for headshots so head is not cut off) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 w-16 shrink-0">Op / Ned:</span>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-black text-slate-900 w-10 text-right tabular-nums">
                {offsetY > 0 ? `+${offsetY}` : offsetY}%
              </span>
            </div>

            {/* Horizontal Position Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 w-16 shrink-0">Venstre/H:</span>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-black text-slate-900 w-10 text-right tabular-nums">
                {offsetX > 0 ? `+${offsetX}` : offsetX}%
              </span>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Nulstil placering</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-800 font-bold rounded-xl border-2 border-slate-300 text-xs transition-colors cursor-pointer"
          >
            Annuller
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-xl border-2 border-slate-900 text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={16} className="stroke-[3]" />
            <span>Gem og brug scene</span>
          </button>
        </div>
      </div>
    </div>
  );
};
