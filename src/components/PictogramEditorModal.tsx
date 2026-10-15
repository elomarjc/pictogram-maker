import React, { useState } from 'react';
import type { Pictogram, CardFontSize } from '../types';
import { ICONS, COLOR_PRESETS } from '../data/icons';
import { ILLUSTRATIONS } from '../data/illustrations';
import { PictogramCard } from './PictogramCard';
import { X, Upload, Trash2, Check, Sparkles } from 'lucide-react';

interface PictogramEditorModalProps {
  pictogram: Pictogram | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pic: Pictogram) => void;
}

export const PictogramEditorModal: React.FC<PictogramEditorModalProps> = ({
  pictogram,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !pictogram) return null;

  const [title, setTitle] = useState(pictogram.title);
  const [subtitle, setSubtitle] = useState(pictogram.subtitle || '');
  const [time, setTime] = useState(pictogram.time || '');
  const [iconId, setIconId] = useState(pictogram.iconId || 'smile');
  const [illustrationId, setIllustrationId] = useState(pictogram.illustrationId || 'spisetid');
  const [customImageUrl, setCustomImageUrl] = useState(pictogram.customImageUrl || '');
  const [bgColor, setBgColor] = useState(pictogram.bgColor || '#FEF08A');
  const [fontSize, setFontSize] = useState<CardFontSize>(pictogram.fontSize || 'base');
  const [activeTab, setActiveTab] = useState<'illustrations' | 'icons' | 'upload'>('illustrations');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vælg venligst en gyldig billedfil (f.eks. PNG eller JPEG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Angiv venligst en titel på aktiviteten.');
      return;
    }

    onSave({
      ...pictogram,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      time: time.trim() || undefined,
      iconId,
      illustrationId: customImageUrl ? undefined : illustrationId,
      customImageUrl: customImageUrl || undefined,
      bgColor,
      fontSize,
    });
    onClose();
  };

  // Preview object for the live preview card
  const previewPic: Pictogram = {
    ...pictogram,
    title: title || 'Aktivitetsnavn',
    subtitle: subtitle || undefined,
    time: time || undefined,
    iconId,
    illustrationId: customImageUrl ? undefined : illustrationId,
    customImageUrl: customImageUrl || undefined,
    bgColor,
    fontSize,
  };

  const iconCategories = ['Alle', 'Mad & Drikke', 'Hygiejne & Pleje', 'Pligter', 'Aktiviteter', 'Rutine & Ro'];
  const filteredIcons = Object.values(ICONS).filter(
    (icon) => selectedCategory === 'Alle' || icon.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-900 bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center">
              <Sparkles size={18} className="text-slate-900" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {pictogram.id ? 'Rediger piktogram' : 'Nyt piktogram'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-amber-200 text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Live Preview Box */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Forhåndsvisning af piktogram:
            </span>
            <div className="max-w-xl mx-auto">
              <PictogramCard
                pictogram={previewPic}
                index={0}
                totalCount={1}
                viewMode="strip"
                onEdit={() => {}}
                onDuplicate={() => {}}
                onDelete={() => {}}
                onMoveUp={() => {}}
                onMoveDown={() => {}}
                onMoveToDay={() => {}}
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800">
                Aktivitetens navn *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="F.eks. Spisetid, Morgenmad, Medicin"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800">
                Undertitel / detaljer (valgfrit)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="F.eks. Husk et glas vand"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800">
                Klokkeslæt / Tidspunkt (valgfrit)
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="F.eks. 08:00 eller Formiddag"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-800">
                Tekststørrelse
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['sm', 'base', 'lg', 'xl'] as CardFontSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border-2 transition-all ${
                      fontSize === size
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {size === 'sm' ? 'Lille' : size === 'base' ? 'Mellem' : size === 'lg' ? 'Stor' : 'Ekstra'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color palette selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">
              Kortets baggrundsfarve
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBgColor(preset.bg)}
                  style={{ backgroundColor: preset.bg }}
                  className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-transform hover:scale-110 shadow-xs ${
                    bgColor === preset.bg ? 'ring-3 ring-amber-500 scale-105' : ''
                  }`}
                  title={preset.name}
                >
                  {bgColor === preset.bg && <Check size={16} className="text-slate-900 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Visual asset picker tabs */}
          <div className="space-y-3 pt-2">
            <div className="flex border-b-2 border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('illustrations')}
                className={`py-2 px-4 font-bold text-sm border-b-2 -mb-[2px] transition-colors ${
                  activeTab === 'illustrations'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Tegninger & Illustrationer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('icons')}
                className={`py-2 px-4 font-bold text-sm border-b-2 -mb-[2px] transition-colors ${
                  activeTab === 'icons'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Piktogram Symboler
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-4 font-bold text-sm border-b-2 -mb-[2px] transition-colors ${
                  activeTab === 'upload'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload eget billede
              </button>
            </div>

            {/* TAB 1: Preset Illustrations */}
            {activeTab === 'illustrations' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Tydelige illustrationer tilpasset de daglige aktiviteter (fra referencen):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {Object.values(ILLUSTRATIONS).map((item) => {
                    const ItemSvg = item.svg;
                    const isSelected = !customImageUrl && illustrationId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIllustrationId(item.id);
                          setCustomImageUrl('');
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="w-16 h-12 flex items-center justify-center">
                          <ItemSvg className="w-full h-full" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 mt-1 text-center line-clamp-1">
                          {item.name.split(' (')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Categorized Pictogram Icons */}
            {activeTab === 'icons' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {iconCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-1">
                  {filteredIcons.map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = iconId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIconId(item.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                        }`}
                        title={item.name}
                      >
                        <ItemIcon size={22} className="text-slate-800" />
                        <span className="text-[10px] font-semibold text-slate-700 mt-1 text-center line-clamp-1">
                          {item.name.split(' (')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Upload Custom Image */}
            {activeTab === 'upload' && (
              <div className="space-y-3 p-2">
                <p className="text-xs text-slate-600">
                  Du kan uploade et billede direkte fra din computer. Billedet gemmes lokalt i din browsersession og sendes ikke til en server.
                </p>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-900 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50 shadow-xs">
                    <Upload size={16} />
                    Vælg billede fra computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {customImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomImageUrl('')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold"
                    >
                      <Trash2 size={14} />
                      Fjern eget billede
                    </button>
                  )}
                </div>
                {customImageUrl && (
                  <div className="w-28 h-28 border-2 border-slate-900 rounded-xl overflow-hidden bg-slate-100 p-1">
                    <img
                      src={customImageUrl}
                      alt="Uploadet"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 shadow-sm transition-all"
            >
              Gem piktogram
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
