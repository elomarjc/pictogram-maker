import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import type { Persona } from '../types';
import {
  DEFAULT_SCENE_DEFINITIONS,
  generateAllMissingScenes,
  getMissingScenesForPersona,
  getReadyScenesCount,
  type SceneGenProgress,
} from '../services/characterSceneGenerator';
import { getAllPersonas } from '../services/personas';

interface SceneGenerationModalProps {
  isOpen: boolean;
  persona: Persona | null;
  onClose: () => void;
  onPersonaUpdated?: (updatedPersona: Persona) => void;
}

export const SceneGenerationModal: React.FC<SceneGenerationModalProps> = ({
  isOpen,
  persona,
  onClose,
  onPersonaUpdated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState<SceneGenProgress>({
    total: 0,
    completed: 0,
    percent: 0,
    done: false,
  });
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(persona);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync internal persona state when prop changes
  useEffect(() => {
    if (persona) {
      // Refresh from storage if available
      const all = getAllPersonas();
      const fresh = all.find((p) => p.id === persona.id) || persona;
      setCurrentPersona(fresh);
    }
  }, [persona, isOpen]);

  // Start generation automatically when opened and missing scenes exist
  useEffect(() => {
    if (!isOpen || !currentPersona || isGenerating) return;

    const missing = getMissingScenesForPersona(currentPersona);
    if (missing.length === 0) {
      setProgress({
        total: DEFAULT_SCENE_DEFINITIONS.length,
        completed: DEFAULT_SCENE_DEFINITIONS.length,
        percent: 100,
        done: true,
      });
      return;
    }

    startGeneration(currentPersona);

    return () => {
      // Don't auto-abort on unmount if minimized
    };
  }, [isOpen, currentPersona?.id]);

  const startGeneration = async (targetPersona: Persona) => {
    setErrorMsg(null);
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const updated = await generateAllMissingScenes(
        targetPersona,
        (p) => {
          setProgress(p);
          if (p.error) {
            setErrorMsg(p.error);
          }
          // Refresh current persona to display completed scenes live in grid
          const all = getAllPersonas();
          const fresh = all.find((x) => x.id === targetPersona.id);
          if (fresh) {
            setCurrentPersona(fresh);
            onPersonaUpdated?.(fresh);
          }
        },
        { signal: controller.signal }
      );

      setCurrentPersona(updated);
      onPersonaUpdated?.(updated);
    } catch (err) {
      if (!controller.signal.aborted) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  if (!isOpen || !currentPersona) return null;

  const { ready, total } = getReadyScenesCount(currentPersona);
  const scenesMap = currentPersona.activityScenes || {};

  // Minimized floating banner at bottom-right
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white border-3 border-slate-900 rounded-2xl shadow-2xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200">
        <div className="w-10 h-10 rounded-xl border-2 border-slate-900 overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={currentPersona.avatarUrl}
            alt={currentPersona.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-[160px]">
          <div className="flex items-center justify-between text-xs font-black text-slate-900">
            <span>Genererer scener</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="w-full bg-slate-100 border border-slate-900 rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-bold mt-0.5 truncate max-w-[180px]">
            {progress.currentSceneTitle ? progress.currentSceneTitle : `${ready} af ${total} klar`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            title="Åbn fuld visning"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <Maximize2 size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Luk"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs">
              <Sparkles size={18} className="text-amber-600 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                Standardscener til figur
              </h2>
              <span className="text-xs font-bold text-slate-800">
                Opretter automatisk de 14 standard piktogramscener
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimer til hjørnet og fortsæt i baggrunden"
              className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
            >
              <Minimize2 size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/10 text-slate-900 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Persona Info & Progress Banner */}
        <div className="px-5 py-3.5 bg-slate-50 border-b-2 border-slate-900">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl border-2 border-slate-900 overflow-hidden bg-white shadow-xs flex-shrink-0">
                <img
                  src={currentPersona.avatarUrl}
                  alt={currentPersona.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {currentPersona.name && !currentPersona.name.startsWith('avatar_')
                    ? currentPersona.name
                    : 'Ny figur'}
                </h3>
                <span className="text-xs font-bold text-slate-600">
                  {ready === total
                    ? 'Alle 14 standardscener er klar!'
                    : isGenerating
                    ? `Genererer scene: ${progress.currentSceneTitle || 'Forbereder...'}`
                    : `${ready} af ${total} scener er klar`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-slate-900">
                {ready} / {total}
              </span>
              <span className="block text-[11px] font-bold text-slate-500">
                ({progress.percent}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 border-2 border-slate-900 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-300 ${
                ready === total ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.max(5, (ready / total) * 100)}%` }}
            />
          </div>

          {errorMsg && (
            <div className="mt-2.5 p-2 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span className="line-clamp-1">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 14 Scenes Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DEFAULT_SCENE_DEFINITIONS.map((sceneDef) => {
              const sceneUrl = scenesMap[sceneDef.key];
              const isCurrent = isGenerating && progress.currentSceneKey === sceneDef.key;
              const isDone = !!sceneUrl;

              return (
                <div
                  key={sceneDef.key}
                  className={`flex flex-col rounded-2xl border-2 transition-all p-2 relative overflow-hidden ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : isCurrent
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400 shadow-md'
                      : 'border-slate-300 bg-slate-50 opacity-70'
                  }`}
                >
                  {/* Status badge */}
                  <div className="absolute top-1.5 right-1.5 z-10">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <CheckCircle2 size={13} className="stroke-[2.5]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs animate-spin">
                        <Loader2 size={13} className="stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center">
                        <Clock size={11} />
                      </div>
                    )}
                  </div>

                  {/* Scene Preview Container (matching 2126x740 ratio) */}
                  <div
                    style={{ backgroundColor: sceneDef.defaultBgColor }}
                    className="w-full aspect-[2126/740] rounded-xl border border-slate-900/30 overflow-hidden flex items-center justify-center relative mb-2 shadow-inner"
                  >
                    {sceneUrl ? (
                      <img
                        src={sceneUrl}
                        alt={sceneDef.title}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : isCurrent ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-800">
                        <Loader2 size={18} className="animate-spin text-slate-900" />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          Genererer...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="text-[10px] font-bold">Venter i kø</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {sceneDef.title}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 block truncate">
                      {sceneDef.descriptionDanish}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-5 py-3.5 border-t-2 border-slate-900 bg-white flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-600">
            {isGenerating ? (
              <span className="flex items-center gap-1.5 text-amber-700">
                <Loader2 size={14} className="animate-spin" />
                <span>Genererer automatisk... Du kan trygt køre i baggrunden.</span>
              </span>
            ) : ready === total ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-black">
                <CheckCircle2 size={14} />
                <span>Klar! Alle 14 scener er tilgængelige for denne figur.</span>
              </span>
            ) : (
              <span>Tryk for at generere de resterende scener.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <button
                  type="button"
                  onClick={handleStop}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                >
                  Afbryd
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="px-4 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Minimize2 size={14} />
                  <span>Kør i baggrunden</span>
                </button>
              </>
            ) : ready === total ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl border-2 border-slate-900 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Luk og se tavle</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                >
                  Luk
                </button>
                <button
                  type="button"
                  onClick={() => startGeneration(currentPersona)}
                  className="px-5 py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Generer manglende scener</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
