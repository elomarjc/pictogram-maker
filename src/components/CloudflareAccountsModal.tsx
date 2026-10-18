import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  ExternalLink,
  Server,
  Info,
} from 'lucide-react';
import {
  getStoredWorkerAccounts,
  addStoredWorkerAccount,
  deleteStoredWorkerAccount,
  resetAllAccountQuotas,
  checkWorkerHealth,
  getQuotaResetInfo,
  type CloudflareWorkerAccount,
  type QuotaResetInfo,
} from '../services/imageGenerationApi';

interface CloudflareAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountsChanged?: () => void;
}

export const CloudflareAccountsModal: React.FC<CloudflareAccountsModalProps> = ({
  isOpen,
  onClose,
  onAccountsChanged,
}) => {
  const [accounts, setAccounts] = useState<CloudflareWorkerAccount[]>([]);
  const [resetInfo, setResetInfo] = useState<QuotaResetInfo>(getQuotaResetInfo());
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});

  // New account form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const refreshAccounts = () => {
    const list = getStoredWorkerAccounts();
    setAccounts(list);
    setResetInfo(getQuotaResetInfo());
  };

  useEffect(() => {
    if (isOpen) {
      refreshAccounts();
      setFormError(null);
    }
  }, [isOpen]);

  // Update countdown every 30 seconds while open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setResetInfo(getQuotaResetInfo());
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      setFormError('Indtast venligst en gyldig Worker URL.');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setFormError('URL skal starte med https:// eller http://');
      return;
    }

    const defaultName = `Konto ${accounts.length + 1}`;
    addStoredWorkerAccount({
      name: newName.trim() || defaultName,
      url: trimmedUrl,
      apiKey: newApiKey.trim() || undefined,
    });

    setNewName('');
    setNewUrl('');
    setNewApiKey('');
    refreshAccounts();
    onAccountsChanged?.();
  };

  const handleDelete = (id: string) => {
    deleteStoredWorkerAccount(id);
    refreshAccounts();
    onAccountsChanged?.();
  };

  const handleResetQuotas = () => {
    resetAllAccountQuotas();
    refreshAccounts();
    onAccountsChanged?.();
  };

  const handleTestConnection = async (account: CloudflareWorkerAccount) => {
    setTestingId(account.id);
    try {
      const result = await checkWorkerHealth(account.url);
      if (result.ok) {
        setTestResults((prev) => ({
          ...prev,
          [account.id]: {
            ok: true,
            message: `Online (${result.defaultModel || 'Flux AI klar'})`,
          },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [account.id]: {
            ok: false,
            message: result.error || 'Kunne ikke forbinde',
          },
        }));
      }
    } catch (e) {
      setTestResults((prev) => ({
        ...prev,
        [account.id]: {
          ok: false,
          message: e instanceof Error ? e.message : 'Forbindelsesfejl',
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const activeCount = accounts.filter((a) => !a.isExhausted).length;
  const exhaustedCount = accounts.filter((a) => a.isExhausted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border-4 border-slate-900 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-slate-900 bg-amber-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs">
              <Server size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                Cloudflare AI Konti & Rotation
              </h3>
              <p className="text-[11px] font-bold text-amber-950">
                {activeCount} aktiv(e) konto / {accounts.length} total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-slate-900 transition-colors shadow-xs"
          >
            <X size={16} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-slate-800">
          {/* Status summary banner */}
          {exhaustedCount > 0 ? (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
              <Clock className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="text-xs space-y-1">
                <div className="font-black text-amber-900">
                  {activeCount > 0
                    ? `${exhaustedCount} konto har opbrugt dagens kvote – appen roterer automatisk til de aktive konti!`
                    : 'Alle dine tilknyttede konti har opbrugt dagens gratis kvote!'}
                </div>
                <p className="text-amber-800">
                  Kvoten (10.000 neuroner pr. konto) nulstilles automatisk{' '}
                  <strong>kl. {resetInfo.localTimeStr}</strong> (om {resetInfo.countdownStr}).
                </p>
                {activeCount === 0 && (
                  <p className="font-bold text-amber-950">
                    💡 Tip: Tilføj en ekstra Cloudflare konto nedenfor for at fortsætte med det samme!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3 flex items-center justify-between text-xs shadow-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Alle {accounts.length} konti er klar til billedgenerering.</span>
              </div>
              <span className="text-[11px] font-black px-2 py-0.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800">
                100% Online
              </span>
            </div>
          )}

          {/* Account List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Tilknyttede Konti ({accounts.length})
              </h4>
              {exhaustedCount > 0 && (
                <button
                  onClick={handleResetQuotas}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors underline cursor-pointer"
                >
                  <RotateCw size={12} />
                  <span>Nulstil kvote-status manuelt</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {accounts.map((acc, index) => {
                const test = testResults[acc.id];
                return (
                  <div
                    key={acc.id}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      acc.isExhausted
                        ? 'border-amber-300 bg-amber-50/60'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs text-slate-900">
                            {acc.name || `Konto ${index + 1}`}
                          </span>
                          {index === 0 && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600">
                              Standard
                            </span>
                          )}
                          {acc.isExhausted ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-amber-800 flex items-center gap-1">
                              <Clock size={10} />
                              Kvote opbrugt indtil kl. {resetInfo.localTimeStr}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Aktiv
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={acc.url}>
                          {acc.url}
                        </p>

                        {test && (
                          <div
                            className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${
                              test.ok ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {test.ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            <span>{test.message}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleTestConnection(acc)}
                          disabled={testingId === acc.id}
                          className="px-2.5 py-1 rounded-xl border border-slate-300 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {testingId === acc.id ? 'Tester...' : 'Test'}
                        </button>
                        {accounts.length > 1 && (
                          <button
                            onClick={() => handleDelete(acc.id)}
                            title="Fjern konto"
                            className="p-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Account Form */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Plus size={14} className="stroke-[3]" />
              <span>Tilføj ekstra Cloudflare konto</span>
            </h4>
            <p className="text-[11px] text-slate-600 mb-3">
              Tilføj en anden Cloudflare Worker URL for at fordoble din daglige gratis kvote (+10.000 neuroner pr. konto).
            </p>

            <form onSubmit={handleAddAccount} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kontonavn (fx &quot;Konto 2&quot; eller &quot;Arbejde&quot;)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="F.eks. Min anden konto"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    API-nøgle (valgfri)
                  </label>
                  <input
                    type="text"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Kun hvis API_KEY er slået til"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cloudflare Worker URL *
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://free-image-generation-api.dit-brugernavn.workers.dev"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono focus:border-slate-900 focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>{formError}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 font-black text-xs text-slate-900 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Gem og tilføj konto til rotationspuljen</span>
              </button>
            </form>
          </div>

          {/* Step by step guide */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-950 space-y-1.5">
            <div className="font-black flex items-center gap-1.5 text-sky-900">
              <Info size={14} className="text-sky-600 shrink-0" />
              <span>Sådan får du flere gratis Cloudflare konti:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-sky-900/90 pl-1">
              <li>
                Opret en ny gratis konto på{' '}
                <a
                  href="https://dash.cloudflare.com/sign-up"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-0.5"
                >
                  cloudflare.com <ExternalLink size={10} />
                </a>{' '}
                (hver konto har 10.000 gratis neuroner hver dag).
              </li>
              <li>
                I terminalen for din worker mappe (<code>free-image-generation-api/</code>): Kør{' '}
                <code className="bg-sky-100 px-1 py-0.5 rounded font-mono">npx wrangler login</code> og log ind med den nye konto.
              </li>
              <li>
                Kør <code className="bg-sky-100 px-1 py-0.5 rounded font-mono">npx wrangler deploy</code>.
              </li>
              <li>Indsæt den nye worker URL herover. Piktogram Maker roterer herefter automatisk imellem dine konti!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500">
            Kvote nulstilles kl. {resetInfo.localTimeStr} (om {resetInfo.countdownStr})
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 font-black text-xs text-slate-900 transition-colors shadow-xs cursor-pointer"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
};
