import React, { useEffect, useRef, useState } from 'react';
import {
  Images,
  Plus,
  Play,
  X,
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  Minimize2,
  Maximize2,
  RotateCw,
  Trash2,
} from 'lucide-react';
import type { Persona } from '../types';
import {
  DEFAULT_SCENE_DEFINITIONS,
  generateAllMissingScenes,
  generateSingleSceneForPersona,
  getMissingScenesForPersona,
  getReadyScenesCount,
  type SceneGenProgress,
  type DefaultSceneDef,
} from '../services/characterSceneGenerator';
import {
  getAllPersonas,
  saveCustomPersona,
  deletePersonaSceneFromDisk,
  deleteAllPersonaScenesFromDisk,
} from '../services/personas';
import { AllAccountsQuotaExceededError } from '../services/imageGenerationApi';
import { ConfirmModal } from './ConfirmModal';

interface SceneGenerationModalProps {
  isOpen: boolean;
  persona: Persona | null;
  onClose: () => void;
  onPersonaUpdated?: (updatedPersona: Persona) => void;
  autoStart?: boolean;
}

export const SceneGenerationModal: React.FC<SceneGenerationModalProps> = ({
  isOpen,
  persona,
  onClose,
  onPersonaUpdated,
  autoStart = false,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeCardKey, setActiveCardKey] = useState<string | null>(null);

  const [progress, setProgress] = useState<SceneGenProgress>({
    total: 0,
    completed: 0,
    percent: 0,
    done: false,
  });
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(persona);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    message: string | React.ReactNode;
    previewImage?: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Sync internal persona state when prop changes
  useEffect(() => {
    if (persona) {
      // Refresh from storage if available
      const all = getAllPersonas();
      const fresh = all.find((p) => p.id === persona.id) || persona;
      setCurrentPersona(fresh);
      setActiveCardKey(null);
    }
  }, [persona, isOpen]);

  // Initialize progress and auto-start if requested
  useEffect(() => {
    if (!isOpen || !currentPersona || isGenerating) return;

    const { ready, total } = getReadyScenesCount(currentPersona);
    const missing = getMissingScenesForPersona(currentPersona);

    setProgress({
      total: total || DEFAULT_SCENE_DEFINITIONS.length,
      completed: ready,
      percent: total > 0 ? Math.round((ready / total) * 100) : 0,
      done: missing.length === 0,
    });

    if (missing.length === 0) {
      return;
    }

    if (autoStart) {
      startGeneration(currentPersona);
    }
  }, [isOpen, currentPersona?.id, autoStart]);

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

  const handleGenerateSingleCard = async (sceneDef: DefaultSceneDef) => {
    if (!currentPersona || isGenerating) return;

    setErrorMsg(null);
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const updated = await generateSingleSceneForPersona(
        currentPersona,
        sceneDef,
        (p) => {
          setProgress(p);
          if (p.error) {
            setErrorMsg(p.error);
          }
          const all = getAllPersonas();
          const fresh = all.find((x) => x.id === currentPersona.id);
          if (fresh) {
            setCurrentPersona(fresh);
            onPersonaUpdated?.(fresh);
          }
        },
        { signal: controller.signal }
      );

      setCurrentPersona(updated);
      onPersonaUpdated?.(updated);

      const { ready, total } = getReadyScenesCount(updated);
      setProgress((prev) => ({
        ...prev,
        completed: ready,
        percent: total > 0 ? Math.round((ready / total) * 100) : 0,
        done: ready === total,
      }));
    } catch (err) {
      const isAllQuota =
        err instanceof AllAccountsQuotaExceededError ||
        (err && typeof err === 'object' && 'resetInfo' in err);

      if (isAllQuota) {
        const quotaErr = err as AllAccountsQuotaExceededError;
        setProgress((prev) => ({
          ...prev,
          allQuotaExceeded: true,
          resetInfo: quotaErr.resetInfo,
          done: false,
        }));
      } else {
        setErrorMsg(`Fejl ved ${sceneDef.title}: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleDeleteScene = (sceneKey: string, sceneTitle?: string, sceneImg?: string) => {
    if (!currentPersona || isGenerating) return;

    const label = sceneTitle || 'denne scene';
    setConfirmModal({
      isOpen: true,
      title: `Slet scenen "${label}"?`,
      subtitle: `Figur: ${currentPersona.name || currentPersona.id}`,
      previewImage: sceneImg,
      confirmText: 'Ja, slet scene',
      message: (
        <span>
          Er du sikker på, at du vil slette denne scene? I lokal dev slettes billedfilen også permanent fra{' '}
          <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded font-mono text-[11px]">
            reference/personas/{currentPersona.id}/scenes/
          </code>.
        </span>
      ),
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));

        const updatedScenes = { ...(currentPersona.activityScenes || {}) };
        delete updatedScenes[sceneKey];

        const updatedPersona: Persona = {
          ...currentPersona,
          activityScenes: updatedScenes,
        };

        saveCustomPersona(updatedPersona);
        setCurrentPersona(updatedPersona);
        onPersonaUpdated?.(updatedPersona);

        // Delete from local disk without refreshing the page
        await deletePersonaSceneFromDisk(currentPersona.id, sceneKey);

        const { ready, total } = getReadyScenesCount(updatedPersona);
        setProgress((prev) => ({
          ...prev,
          completed: ready,
          percent: total > 0 ? Math.round((ready / total) * 100) : 0,
          done: ready === total,
        }));
      },
    });
  };

  const handleDeleteAllScenes = () => {
    if (!currentPersona || isGenerating) return;

    setConfirmModal({
      isOpen: true,
      title: 'Slet alle scener?',
      subtitle: `Figur: ${currentPersona.name || currentPersona.id}`,
      confirmText: 'Ja, slet alle scener',
      message: (
        <span>
          Er du sikker på, at du vil slette alle genererede scener for{' '}
          <strong>{currentPersona.name || 'denne figur'}</strong>? I lokal dev slettes alle scene-filer permanent fra disk uden genindlæsning.
        </span>
      ),
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));

        const updatedPersona: Persona = {
          ...currentPersona,
          activityScenes: {},
        };

        saveCustomPersona(updatedPersona);
        setCurrentPersona(updatedPersona);
        onPersonaUpdated?.(updatedPersona);

        await deleteAllPersonaScenesFromDisk(currentPersona.id);

        const { ready, total } = getReadyScenesCount(updatedPersona);
        setProgress({
          total: total || DEFAULT_SCENE_DEFINITIONS.length,
          completed: ready,
          percent: 0,
          done: false,
        });
      },
    });
  };

  if (!isOpen || !currentPersona) return null;

  const { ready, total } = getReadyScenesCount(currentPersona);
  const scenesMap = currentPersona.activityScenes || {};

  // Minimized floating banner at bottom-right
  if (isMinimized) {
    return (
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:bottom-4 z-[100] bg-white border-3 border-slate-900 rounded-2xl shadow-2xl p-2.5 sm:p-3 flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 animate-in slide-in-from-bottom-3 duration-200">
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
            onClick={() => {
              if (isGenerating && abortControllerRef.current) {
                abortControllerRef.current.abort();
              }
              setIsGenerating(false);
              setIsMinimized(false);
              onClose();
            }}
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs">
              <Images size={18} className="text-slate-900" />
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
          <div className="flex items-center gap-1.5">
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
              onClick={() => {
                if (isGenerating) {
                  setIsMinimized(true);
                } else {
                  onClose();
                }
              }}
              title={isGenerating ? 'Minimer til baggrunden' : 'Luk'}
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

            <div className="flex items-center gap-2.5">
              {ready > 0 && !isGenerating && (
                <button
                  type="button"
                  onClick={handleDeleteAllScenes}
                  title="Slet alle genererede scener for denne figur"
                  className="px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Slet alle</span>
                </button>
              )}
              <div className="text-right">
                <span className="text-sm font-black text-slate-900">
                  {ready} / {total}
                </span>
                <span className="block text-[11px] font-bold text-slate-500">
                  ({progress.percent}%)
                </span>
              </div>
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

          {/* Account switch notification */}
          {progress.accountSwitchInfo && (
            <div className="mt-2.5 p-2.5 bg-sky-50 border-2 border-sky-400 rounded-xl flex items-center gap-2 text-sky-900 text-xs font-bold animate-pulse shadow-xs">
              <RotateCw size={15} className="text-sky-600 shrink-0 animate-spin" />
              <span>{progress.accountSwitchInfo}</span>
            </div>
          )}

          {/* All accounts quota exceeded banner */}
          {progress.allQuotaExceeded && (
            <div className="mt-2.5 p-2.5 bg-amber-50 border-2 border-amber-400 rounded-xl shadow-xs flex items-center gap-2.5">
              <Clock size={18} className="text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-black text-amber-950 block">
                  Pause: Dagens gratis grænse er nået
                </span>
                <span className="text-amber-900 text-[11px] block">
                  Klar igen kl. {progress.resetInfo?.localTimeStr || '02:00'} (om{' '}
                  {progress.resetInfo?.countdownStr || 'i nat'}). Dine {ready} scener er gemt.
                </span>
              </div>
            </div>
          )}

          {errorMsg && !progress.allQuotaExceeded && (
            <div className="mt-2.5 p-2 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span className="line-clamp-1">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 14 Scenes Grid */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-5"
          onClick={() => setActiveCardKey(null)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DEFAULT_SCENE_DEFINITIONS.map((sceneDef) => {
              const sceneUrl = scenesMap[sceneDef.key];
              const isCurrent = isGenerating && progress.currentSceneKey === sceneDef.key;
              const isDone = !!sceneUrl;
              const isSelected = activeCardKey === sceneDef.key;

              return (
                <div
                  key={sceneDef.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isGenerating) return;
                    if (isDone) {
                      setActiveCardKey((prev) => (prev === sceneDef.key ? null : sceneDef.key));
                    } else {
                      handleGenerateSingleCard(sceneDef);
                    }
                  }}
                  title={
                    isDone
                      ? isSelected
                        ? `${sceneDef.title} (valgt - tryk for at fravælge)`
                        : `${sceneDef.title} (hold mus over eller tryk for at slette/gen-generere)`
                      : isGenerating
                      ? sceneDef.title
                      : `Klik for at generere ${sceneDef.title}`
                  }
                  className={`flex flex-col rounded-2xl border-2 transition-all p-2 relative overflow-hidden group select-none ${
                    isDone
                      ? isSelected
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400 shadow-md cursor-pointer'
                        : 'border-emerald-500 bg-emerald-50/50 shadow-xs hover:border-amber-500 hover:shadow-md cursor-pointer'
                      : isCurrent
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400 shadow-md'
                      : !isGenerating
                      ? 'border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50/60 hover:shadow-md cursor-pointer opacity-90 hover:opacity-100 hover:scale-[1.02]'
                      : 'border-slate-300 bg-slate-50 opacity-60'
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

                  {/* Delete & Re-generate buttons for completed scenes (visible on hover or when card is selected) */}
                    {isDone && !isGenerating && (
                    <div
                      className={`absolute top-1.5 left-1.5 z-10 flex items-center gap-1 transition-opacity duration-150 ${
                        isSelected
                          ? 'opacity-100 pointer-events-auto'
                          : 'opacity-70 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScene(sceneDef.key, sceneDef.title, sceneUrl);
                        }}
                        title="Slet denne scene"
                        aria-label="Slet denne scene"
                        className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-white/95 hover:bg-rose-600 text-slate-700 hover:text-white border border-slate-300 hover:border-rose-600 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} className="stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateSingleCard(sceneDef);
                        }}
                        title="Gen-generer denne scene"
                        aria-label="Gen-generer denne scene"
                        className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-white/95 hover:bg-amber-400 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-900 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      >
                        <RotateCw size={13} className="stroke-[2.5]" />
                      </button>
                    </div>
                  )}

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
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-500 group-hover:text-amber-800 transition-colors">
                        {!isGenerating ? (
                          <>
                            <Plus size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:scale-110 transition-transform stroke-[2.5]" />
                            <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900">Tryk for at generere</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Venter i kø</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title (undertitle removed) */}
                  <div className="text-center py-0.5">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {sceneDef.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t-2 border-slate-900 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer min-h-[38px]"
                >
                  Afbryd
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <Minimize2 size={14} />
                  <span>Kør i baggrunden</span>
                </button>
              </>
            ) : ready === total ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl border-2 border-slate-900 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                <CheckCircle2 size={14} />
                <span>Luk og se tavle</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs transition-colors cursor-pointer min-h-[38px]"
                >
                  Luk
                </button>
                <button
                  type="button"
                  onClick={() => startGeneration(currentPersona)}
                  className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <Play size={14} className="fill-current" />
                  <span>Generer manglende scener</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* In-app Verification / Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        subtitle={confirmModal.subtitle}
        message={confirmModal.message}
        previewImage={confirmModal.previewImage}
        confirmText={confirmModal.confirmText || 'Ja, slet'}
        cancelText="Annuller"
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
