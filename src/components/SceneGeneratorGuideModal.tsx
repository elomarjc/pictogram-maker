import React, { useState } from 'react';
import type { Persona } from '../types';
import { getPersona } from '../services/personas';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  Info,
  BookOpen,
  ImageIcon,
  Bot,
} from 'lucide-react';
import { PRESET_SCENE_PROMPTS, buildDanishMasterPrompt } from '../data/scenePrompts';

interface SceneGeneratorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona?: Persona;
  defaultScenePrompt?: string;
  onSelectSceneImage?: (dataUrl: string) => void;
}

export const SceneGeneratorGuideModal: React.FC<SceneGeneratorGuideModalProps> = ({
  isOpen,
  persona,
  onClose,
}) => {
  const activePersona = persona || getPersona();
  const [selectedPromptId, setSelectedPromptId] = useState<string>(PRESET_SCENE_PROMPTS[0].id);
  const [customSceneText, setCustomSceneText] = useState<string>(
    PRESET_SCENE_PROMPTS[0].prompt
  );
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedScene, setCopiedScene] = useState(false);

  if (!isOpen) return null;

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  const ref1AvatarUrl = activePersona.avatarUrl || `${baseUrl}reference/ref1_avatar.png`;
  const ref2ExampleUrl = `${baseUrl}reference/ref2_example.jpg`;

  const assembledMasterPrompt = buildDanishMasterPrompt({
    sceneDescription: customSceneText,
    personaName: activePersona.name,
    isWoman: activePersona.id === 'woman_a',
  });

  const handleSelectPreset = (id: string) => {
    setSelectedPromptId(id);
    const found = PRESET_SCENE_PROMPTS.find((p) => p.id === id);
    if (found) {
      setCustomSceneText(found.prompt);
    }
  };

  const copyToClipboard = async (text: string, isMaster: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isMaster) {
        setCopiedMaster(true);
        setTimeout(() => setCopiedMaster(false), 2200);
      } else {
        setCopiedScene(true);
        setTimeout(() => setCopiedScene(false), 2200);
      }
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (isMaster) {
        setCopiedMaster(true);
        setTimeout(() => setCopiedMaster(false), 2200);
      } else {
        setCopiedScene(true);
        setTimeout(() => setCopiedScene(false), 2200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border-3 border-slate-900 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-xs">
              <Sparkles size={20} className="text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                Guide: Lav nye scener & figurer til piktogrammer
              </h2>
              <p className="text-xs font-bold text-slate-800 mt-1">
                Dansk Master Prompt til ChatGPT med gennemsigtig baggrund for {activePersona.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* SECTION: Reference Images (Ref 1 & Ref 2) */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ImageIcon size={18} className="text-amber-500" />
                1. De to referencebilleder (Ref 1 & Ref 2)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Ref 1 er din valgte figur (<strong>{activePersona.name}</strong>), og Ref 2 er tegnestilen.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ref 1: Character Avatar */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-24 h-24 shrink-0 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={ref1AvatarUrl}
                    alt={activePersona.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-black text-[11px]">
                    Ref 1 — Figur ({activePersona.name})
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-tight">
                    Figur-reference: Ansigt, hudtone, frisure og tøj for den valgte person.
                  </p>
                  <div className="pt-1">
                    <a
                      href={ref1AvatarUrl}
                      download={`ref1-${activePersona.id === 'woman_a' ? 'kvinde' : 'mand'}-avatar.webp`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors"
                    >
                      <Download size={13} />
                      Download Ref 1 ({activePersona.name})
                    </a>
                  </div>
                </div>
              </div>

              {/* Ref 2: Visual Style Example */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-24 h-24 shrink-0 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={ref2ExampleUrl}
                    alt="Ref 2 Example layout"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[11px]">
                    Ref 2 — Piktogram Stilart
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-tight">
                    Reference for tegnestil: Tydelige sorte streger, enkle cel-shading farver og venligt udtryk.
                  </p>
                  <div className="pt-1">
                    <a
                      href={ref2ExampleUrl}
                      download="ref2-piktogram-stilart.jpg"
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors"
                    >
                      <Download size={13} />
                      Download Ref 2 (Stilart)
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2 text-xs text-sky-900">
              <Info size={16} className="text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Vil du lave en helt ny person?</strong> Skift blot <strong>Ref 1</strong> ud med et billede af den nye person (f.eks. et barn, en ven eller en anden karakter). ChatGPT bevarer automatisk stilen fra Ref 2.
              </div>
            </div>
          </div>

          {/* SECTION: Scene Prompt Selector & Custom Prompt Editor */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-500" />
                  2. Vælg scene eller skriv den du mangler
                </h3>
                <p className="text-xs text-slate-600">
                  Vælg en foruddefineret rutine eller skriv din egen scene på dansk:
                </p>
              </div>

              {/* Preset Selector dropdown */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedPromptId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full sm:w-64 px-3 py-1.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:border-slate-900"
                >
                  {PRESET_SCENE_PROMPTS.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.category}] {item.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Scenebeskrivelse (på dansk):
              </label>
              <textarea
                rows={2}
                value={customSceneText}
                onChange={(e) => setCustomSceneText(e.target.value)}
                placeholder="Skriv scenen på dansk (f.eks.: Figuren sidder og drikker et glas vand...)"
                className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl font-medium text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(customSceneText, false)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  {copiedScene ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copiedScene ? 'Kopieret scenebeskrivelse!' : 'Kopiér kun denne linje'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: Complete Master Prompt for Copying */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <Bot size={18} />
                  3. Fuld Dansk Master Prompt klar til ChatGPT
                </h3>
                <p className="text-xs text-slate-300">
                  Indeholder krav om gennemsigtig baggrund (transparent PNG) og er tilpasset {activePersona.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(assembledMasterPrompt, true)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-sm ${
                  copiedMaster
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                }`}
              >
                {copiedMaster ? <Check size={16} /> : <Copy size={16} />}
                {copiedMaster ? 'Kopieret til udklipsholder!' : 'Kopiér komplet Master Prompt'}
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-950/80 rounded-xl font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                {assembledMasterPrompt}
              </pre>
            </div>
          </div>

          {/* SECTION: Step-by-step ChatGPT Guide */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              Sådan udfører du det i ChatGPT:
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed font-medium">
              <li>
                Åbn <strong>ChatGPT</strong>.
              </li>
              <li>
                Klik på <strong>+</strong> ikonet og vedhæft <strong>Ref 1</strong> ({activePersona.name}) samt <strong>Ref 2</strong> (stilart).
              </li>
              <li>
                Indsæt den kopierede <strong>Master Prompt</strong> og tryk <strong>Send</strong>.
              </li>
              <li>
                Gem det genererede billede som transparent PNG og upload det direkte i piktogrammet under <em>"Upload eget billede"</em>.
              </li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Dansk Master Prompt sikrer gennemsigtig baggrund og karakter-konsistens.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 font-black text-xs text-slate-900 hover:bg-amber-500 shadow-xs transition-colors"
          >
            Forstået / Luk
          </button>
        </div>

      </div>
    </div>
  );
};
