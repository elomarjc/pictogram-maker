import React, { useState } from 'react';
import type { Pictogram, CardFontSize, Persona } from '../types';
import { ICONS } from '../data/icons';
import { getPersona, REFERENCE_ICONS } from '../services/personas';
import { PictogramCard } from './PictogramCard';
import { X, Upload, Trash2, Check, Sparkles } from 'lucide-react';

interface PictogramEditorModalProps {
  pictogram: Pictogram | null;
  isOpen: boolean;
  persona?: Persona;
  onClose: () => void;
  onSave: (pic: Pictogram) => void;
}

const REFERENCE_COLOR_PRESETS = [
  { id: 'pink', name: 'Vasketøj (Lyserød)', bg: '#fbb6db' },
  { id: 'yellow', name: 'Kaffe/Morgenmad (Gul)', bg: '#fdef8c' },
  { id: 'green', name: 'Medicin (Grøn)', bg: '#c1ea9a' },
  { id: 'cyan', name: 'Badetid (Lyseblå)', bg: '#9adafd' },
  { id: 'orange', name: 'Spisetid (Fersken)', bg: '#fdc67c' },
  { id: 'purple', name: 'Aktiviteter (Lilla)', bg: '#ccadfb' },
  { id: 'mint', name: 'Vaske op (Mint)', bg: '#9ceacc' },
  { id: 'lavender', name: 'Bolle (Lavendel)', bg: '#cdb7f8' },
  { id: 'blue', name: 'Sengetid (Blå)', bg: '#97d9fc' },
  { id: 'white', name: 'Hvid (Neutral)', bg: '#ffffff' },
];

const SCENE_DESCRIPTIONS: Record<string, string> = {
  vaesketoeg: 'Hænge vasketøj op',
  kaffe: 'The & Kaffe',
  medicin: 'Medicin',
  badetid: 'Badetid',
  spisetid: 'Spisetid (Frokost/Aftensmad)',
  aktiviteter: 'Aktiviteter & Hobby',
  vaske_op: 'Vaske op',
  bolle: 'Bolle / Eftermiddag',
  sengetid: 'Sengetid & Sove',
  gatur: 'Gåtur / Frisk luft',
  rede_seng: 'Rede seng',
  pause_sofa: 'Pause på sofa / TV',
  skraldespand: 'Skrald & Flasker',
  handle: 'Handle indkøb',
};

const REFERENCE_ICON_NAMES: Record<string, string> = {
  toej_snor: 'Tørresnor',
  kop: 'Kaffekop',
  piller: 'Medicin/Piller',
  bruser: 'Bruser',
  tallerken_bestik: 'Tallerken & Bestik',
  opvask: 'Opvask',
  bolle_ikon: 'Bolle',
  seng_ikon: 'Seng',
  sun: 'Sol',
  cloud: 'Sky',
};

export const PictogramEditorModal: React.FC<PictogramEditorModalProps> = ({
  pictogram,
  isOpen,
  persona,
  onClose,
  onSave,
}) => {
  if (!isOpen || !pictogram) return null;

  const activePersona = persona || getPersona();
  const [title, setTitle] = useState(pictogram.title);
  const [subtitle, setSubtitle] = useState(pictogram.subtitle || '');
  const [time, setTime] = useState(pictogram.time || '');
  const [iconId, setIconId] = useState(pictogram.iconId || 'smile');
  const [illustrationId, setIllustrationId] = useState(pictogram.illustrationId || 'spisetid');
  const [sceneImageUrl, setSceneImageUrl] = useState(pictogram.sceneImageUrl || '');
  const [rightIconUrl, setRightIconUrl] = useState(pictogram.rightIconUrl || '');
  const [customImageUrl, setCustomImageUrl] = useState(pictogram.customImageUrl || '');
  const [bgColor, setBgColor] = useState(pictogram.bgColor || '#fdef8c');
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
      sceneImageUrl: sceneImageUrl || undefined,
      rightIconUrl: rightIconUrl || undefined,
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
    sceneImageUrl: sceneImageUrl || undefined,
    rightIconUrl: rightIconUrl || undefined,
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
              Rediger Piktogram
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Live Preview section */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Forhåndsvisning (som det vises på tavlen)
            </label>
            <div className="p-3 bg-slate-100 rounded-2xl border-2 border-slate-900 flex justify-center">
              <div className="w-full max-w-xl">
                <PictogramCard
                  pictogram={previewPic}
                  persona={activePersona}
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
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as CardFontSize)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white font-medium text-slate-900"
              >
                <option value="sm">Lille (kompakt)</option>
                <option value="base">Normal (standard)</option>
                <option value="lg">Stor (tydelig)</option>
                <option value="xl">Ekstra stor (maksimal læsbarhed)</option>
              </select>
            </div>
          </div>

          {/* Color palette selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800">
              Kortets baggrundsfarve (reference-pasteller)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {REFERENCE_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setBgColor(preset.bg)}
                  style={{ backgroundColor: preset.bg }}
                  className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-transform hover:scale-110 shadow-xs ${
                    bgColor.toLowerCase() === preset.bg.toLowerCase() ? 'ring-3 ring-amber-500 scale-105' : ''
                  }`}
                  title={preset.name}
                >
                  {bgColor.toLowerCase() === preset.bg.toLowerCase() && <Check size={16} className="text-slate-900 stroke-[3]" />}
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
                Figur-scene ({activePersona.name.split(' (')[0]})
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
                Piktogram-ikoner (Højre side)
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

            {/* TAB 1: Persona Activity Scenes */}
            {activeTab === 'illustrations' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Vælg aktiviteten for {activePersona.name}. Figuren i venstre side opdateres automatisk:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {Object.entries(activePersona.activityScenes).map(([key, imgUrl]) => {
                    const isSelected = !customImageUrl && illustrationId === key;
                    const label = SCENE_DESCRIPTIONS[key] || key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setIllustrationId(key);
                          setSceneImageUrl('');
                          setCustomImageUrl('');
                        }}
                        className={`flex flex-col items-center justify-between p-2 rounded-2xl border-2 transition-all overflow-hidden ${
                          isSelected
                            ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400 shadow-sm'
                            : 'bg-slate-50 border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="w-full h-16 rounded-xl border border-slate-900/30 overflow-hidden bg-white mb-1.5">
                          <img src={imgUrl} alt={label} className="w-full h-full object-cover object-center" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-900 text-center line-clamp-1">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Categorized Pictogram Icons & Reference Icons */}
            {activeTab === 'icons' && (
              <div className="space-y-3">
                {/* Reference Isolated Icons */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">Reference piktogram-ikoner:</span>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-1">
                    {Object.entries(REFERENCE_ICONS).map(([iconKey, iconPath]) => {
                      const isSelected = rightIconUrl === iconPath;
                      const name = REFERENCE_ICON_NAMES[iconKey] || iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setRightIconUrl(iconPath)}
                          className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-400'
                              : 'bg-white border-slate-300 hover:border-slate-500'
                          }`}
                          title={name}
                        >
                          <img src={iconPath} alt={name} className="w-8 h-8 object-contain" />
                          <span className="text-[9px] font-bold text-slate-700 mt-0.5 truncate w-full text-center">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vector Icons */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Symbol-bibliotek:</span>
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
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredIcons.map((item) => {
                      const ItemIcon = item.icon;
                      const isSelected = !rightIconUrl && iconId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setIconId(item.id);
                            setRightIconUrl('');
                          }}
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
              </div>
            )}

            {/* TAB 3: Upload Custom Image */}
            {activeTab === 'upload' && (
              <div className="space-y-3 p-2">
                <p className="text-xs text-slate-600">
                  Du kan uploade et billede direkte fra din computer. Billedet gemmes lokalt i din browsersession og sendes ikke til en server.
                </p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-bold text-sm cursor-pointer shadow-sm transition-colors text-slate-900">
                    <Upload size={16} />
                    Vælg billedfil...
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
                      className="flex items-center gap-1 text-xs text-rose-600 font-bold hover:underline"
                    >
                      <Trash2 size={14} />
                      Fjern billede
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-sm transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-slate-900 text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Check size={18} className="stroke-[3]" />
              Gem piktogram
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
