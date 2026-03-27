import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { WORDS, THEMES, CAT_LABELS, normalize, wordKey, wiktUrl, buildSmartDeck, shuffle, STORAGE_KEY, type Word, type Stats } from "./data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Toggle } from "@/components/ui/toggle";
import { ExternalLink, ChevronDown, RotateCcw, ArrowRight, Lightbulb, SkipForward, Check } from "lucide-react";

interface DeckItem { word: Word; def: string; }
interface LastResult { word: Word; def: string; ok: boolean; streak: number; skipped?: boolean; }

export default function App() {
  const [stats, setStats] = useState<Stats>({});
  const statsRef = useRef<Stats>({});
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<DeckItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [sessionErrors, setSessionErrors] = useState<DeckItem[]>([]);
  const [selThemes, setSelThemes] = useState<string[] | null>(null);
  const [started, setStarted] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getPool = useCallback(() => {
    if (!selThemes) return WORDS;
    const cats = THEMES.filter(t => selThemes.includes(t.id)).flatMap(t => t.cats);
    return WORDS.filter(w => cats.includes(w.cat));
  }, [selThemes]);

  const [storageOk, setStorageOk] = useState<boolean | null>(null);

  // Storage abstraction: window.storage (published artifacts) → localStorage fallback
  const storageApi = useRef<{
    get: (key: string) => Promise<{ value: string } | null>;
    set: (key: string, value: string) => Promise<unknown>;
  } | null>(null);

  const initStorage = useCallback(async () => {
    // Try window.storage (Claude artifact persistent storage)
    if (typeof window !== "undefined" && (window as any).storage) {
      try {
        await (window as any).storage.set("__test__", "1");
        storageApi.current = (window as any).storage;
        setStorageOk(true);
        return;
      } catch {}
    }
    // Fallback to localStorage
    if (typeof localStorage !== "undefined") {
      storageApi.current = {
        get: async (key: string) => {
          const v = localStorage.getItem(key);
          return v !== null ? { value: v } : null;
        },
        set: async (key: string, value: string) => {
          localStorage.setItem(key, value);
          return { key, value };
        },
      };
      setStorageOk(true);
      return;
    }
    setStorageOk(false);
  }, []);

  useEffect(() => {
    (async () => {
      await initStorage();
      let s: Stats = {};
      if (storageApi.current) {
        try {
          const r = await storageApi.current.get(STORAGE_KEY);
          if (r?.value) s = JSON.parse(r.value);
        } catch {}
      }
      setStats(s);
      statsRef.current = s;
      setDeck(buildSmartDeck(WORDS, s));
      setStarted(true);
      setLoading(false);
    })();
    const flush = () => {
      if (document.hidden && statsRef.current && storageApi.current) {
        try { storageApi.current.set(STORAGE_KEY, JSON.stringify(statsRef.current)); } catch {}
      }
    };
    const beforeUnload = () => {
      if (statsRef.current && storageApi.current) {
        try { storageApi.current.set(STORAGE_KEY, JSON.stringify(statsRef.current)); } catch {}
      }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [initStorage]);

  const save = useCallback(async (ns: Stats) => {
    setStats(ns);
    statsRef.current = ns;
    if (storageApi.current) {
      try {
        await storageApi.current.set(STORAGE_KEY, JSON.stringify(ns));
      } catch (e) {
        console.error("[storage] save error:", e);
      }
    }
  }, []);

  const restart = useCallback((pool?: Word[]) => {
    const p = pool || getPool();
    setDeck(buildSmartDeck(p, stats));
    setIdx(0); setScore(0); setInput(""); setLastResult(null);
    setShowHint(false); setSessionErrors([]); setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [stats, getPool]);

  const advance = () => {
    setIdx(i => i + 1); setInput(""); setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const submit = () => {
    const item = deck[idx];
    const cur = item.word, key = wordKey(cur);
    const ok = cur.mot.split("/").map(m => normalize(m.trim())).includes(normalize(input));
    const prev = stats[key] || { e: 0, s: 0, last: 0, streak: 0 };
    const upd = { e: prev.e + (ok ? 0 : 1), s: prev.s + (ok ? 1 : 0), last: Date.now(), streak: ok ? (prev.streak || 0) + 1 : 0 };
    save({ ...stats, [key]: upd });
    if (ok) setScore(s => s + (showHint ? 0.5 : 1)); else setSessionErrors(p => [...p, item]);
    setLastResult({ word: cur, def: item.def, ok, streak: upd.streak });
    advance();
  };

  const skip = () => {
    const item = deck[idx];
    const cur = item.word, key = wordKey(cur);
    const prev = stats[key] || { e: 0, s: 0, last: 0, streak: 0 };
    save({ ...stats, [key]: { ...prev, e: prev.e + 1, last: Date.now(), streak: 0 } });
    setSessionErrors(p => [...p, item]);
    setLastResult({ word: cur, def: item.def, ok: false, skipped: true, streak: 0 });
    advance();
  };

  const totalW = WORDS.length;
  const { learned, trouble, unseen } = useMemo(() => ({
    learned: WORDS.filter(w => { const s = stats[wordKey(w)]; return s && s.s > s.e && s.s + s.e >= 2; }).length,
    trouble: WORDS.filter(w => { const s = stats[wordKey(w)]; return s && s.e > s.s; }).length,
    unseen: WORDS.filter(w => !stats[wordKey(w)]).length,
  }), [stats]);
  const sortedWords = useMemo(() => [...WORDS].sort((a, b) => {
    const sa = stats[wordKey(a)] || { e: 0, s: 0 }, sb = stats[wordKey(b)] || { e: 0, s: 0 };
    return (sa.e + sa.s > 0 ? sa.s / (sa.e + sa.s) : -1) - (sb.e + sb.s > 0 ? sb.s / (sb.e + sb.s) : -1);
  }), [stats]);
  const current = deck[idx];
  const done = started && idx >= deck.length && deck.length > 0;
  const progressPct = deck.length > 0 ? (idx / deck.length) * 100 : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-lg italic animate-pulse">Chargement…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[500px] mx-auto px-4 py-6">

        {/* Masthead */}
        <header className="text-center mb-5">
          <p className="text-[10px] tracking-[6px] uppercase text-muted-foreground mb-1">Le quiz du</p>
          <h1 className="text-4xl font-bold tracking-wide text-foreground">Cruciverbiste</h1>
          <Separator className="my-3 bg-border" style={{ height: 3, backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--border)), hsl(var(--border)) 2px, transparent 2px, transparent 6px)" }} />
          <div className="flex justify-center gap-5 text-xs text-muted-foreground">
            <span><b className="text-[hsl(153,40%,30%)]">{learned}</b> maîtrisé{learned > 1 ? "s" : ""}</span>
            <span><b className="text-destructive">{trouble}</b> difficile{trouble > 1 ? "s" : ""}</span>
            <span><b>{unseen}</b> nouveau{unseen > 1 ? "x" : ""}</span>
          </div>
          <div className="mt-2.5 h-1 rounded-sm bg-muted overflow-hidden flex">
            <div className="h-full bg-[hsl(153,40%,30%)] transition-all duration-500" style={{ width: `${(learned / totalW) * 100}%` }} />
            <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${(trouble / totalW) * 100}%` }} />
          </div>
          {storageOk === false && (
            <p className="mt-2 text-[10px] text-destructive">⚠ Sauvegarde indisponible — publiez l'artifact pour activer la persistance</p>
          )}
        </header>

        {/* Theme pills */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-5">
          <Toggle pressed={!selThemes} onPressedChange={() => { setSelThemes(null); restart(WORDS); }}
            size="sm" variant="outline"
            className="h-7 px-3 text-xs font-semibold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-sm"
          >Tous</Toggle>
          {THEMES.map(t => {
            const on = selThemes?.includes(t.id) ?? false;
            return (
              <Toggle key={t.id} pressed={on} onPressedChange={() => {
                let next: string[] | null;
                if (!selThemes) next = [t.id];
                else if (on) { const r = selThemes.filter(x => x !== t.id); next = r.length === 0 ? null : r; }
                else next = [...selThemes, t.id];
                setSelThemes(next);
                const cats = next ? THEMES.filter(th => next!.includes(th.id)).flatMap(th => th.cats) : null;
                restart(cats ? WORDS.filter(w => cats.includes(w.cat)) : WORDS);
              }}
                size="sm" variant="outline"
                className="h-7 px-2.5 text-[11px] font-semibold data-[state=on]:bg-destructive data-[state=on]:text-white rounded-sm"
              >{t.label}</Toggle>
            );
          })}
        </div>

        {/* Result banner */}
        {lastResult && (
          <div onClick={() => setLastResult(null)}
            className={`animate-slide-down flex items-center gap-2.5 px-3.5 py-2.5 mb-4 rounded-sm cursor-pointer border-l-4 ${
              lastResult.ok ? "bg-[hsl(140,40%,94%)] border-l-[hsl(153,40%,30%)]" : "bg-[hsl(0,60%,95%)] border-l-destructive"
            }`}>
            <span className={`text-base font-bold tracking-[3px] ${lastResult.ok ? "text-[hsl(153,40%,30%)]" : "text-destructive"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {lastResult.word.mot}
            </span>
            <span className="flex-1 text-xs text-foreground italic truncate">{lastResult.def}</span>
            {lastResult.ok && lastResult.streak >= 3 && <span className="text-xs">🔥{lastResult.streak}</span>}
            <a href={wiktUrl(lastResult.word)} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Quiz card */}
        {!done && current && (
          <Card className="border-border shadow-sm relative overflow-hidden bg-card">
            <CardContent className="pt-10 pb-6 px-6 text-center">
              <div className="absolute top-3 left-4 right-4 flex justify-between text-[11px] text-muted-foreground">
                <span>{idx + 1} ⁄ {deck.length}</span>
                <span className="text-[hsl(153,40%,30%)] font-bold">{score} ✓</span>
              </div>
              <div className="absolute top-0 left-0 right-0">
                <Progress value={progressPct} className="h-[3px] rounded-none" />
              </div>

              <Badge variant="outline" className="mb-5 text-[10px] tracking-[2px] uppercase font-semibold rounded-sm px-3 py-0.5">
                {CAT_LABELS[current.word.cat] || current.word.cat}
              </Badge>

              <p className="text-xl font-normal italic text-foreground leading-relaxed mb-2 min-h-[66px]">
                {current.def}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {current.word.lettres} lettre{current.word.lettres > 1 ? "s" : ""}
                {showHint && <span className="text-destructive ml-2">— commence par « {current.word.mot[0]} »</span>}
              </p>

              {/* Input */}
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    input.trim() ? submit() : skip();
                  } else if (e.key === "Tab") {
                    e.preventDefault();
                    if (!showHint) setShowHint(true);
                  }
                }}
                autoFocus
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder=""
                maxLength={current.word.lettres + 2}
                className="w-full max-w-[240px] mx-auto block text-center text-2xl font-bold tracking-[6px] py-3 px-4 rounded-sm border-2 border-border bg-background text-foreground outline-none focus:border-foreground transition-colors"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />

              <div className="flex gap-2 justify-center mt-5">
                {!showHint && (
                  <Button variant="outline" size="sm" className="text-xs rounded-sm gap-1"
                    onClick={() => { setShowHint(true); inputRef.current?.focus(); }}>
                    <Lightbulb className="w-3 h-3" /> Indice
                    <kbd className="hidden sm:inline-block ml-1 px-1 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">Tab</kbd>
                  </Button>
                )}
                <Button variant="outline" size="sm" className="text-xs rounded-sm gap-1" onClick={skip}>
                  <SkipForward className="w-3 h-3" /> Passer
                  <kbd className="hidden sm:inline-block ml-1 px-1 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">⏎</kbd>
                </Button>
                <Button size="sm" className="text-xs rounded-sm gap-1" disabled={!input.trim()} onClick={submit}>
                  <Check className="w-3 h-3" /> Valider
                  <kbd className="hidden sm:inline-block ml-1 px-1 py-0.5 text-[9px] font-mono bg-muted rounded border border-border text-muted-foreground">⏎</kbd>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session end */}
        {done && (
          <div className="text-center py-8">
            <p className="text-6xl font-bold text-foreground">
              {score}<span className="text-2xl text-muted-foreground font-normal"> ⁄ {deck.length}</span>
            </p>
            <p className="text-base text-muted-foreground italic mt-1">
              {Math.round((score / deck.length) * 100)}% de réussite
            </p>

            {sessionErrors.length > 0 && (
              <Card className="mt-5 text-left border-l-4 border-l-destructive">
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-[11px] font-bold text-destructive uppercase tracking-[2px] mb-2.5">
                    À revoir · {sessionErrors.length}
                  </p>
                  {sessionErrors.map((item, i) => (
                    <div key={wordKey(item.word)} className={`flex justify-between items-center py-1.5 ${i < sessionErrors.length - 1 ? "border-b border-border" : ""}`}>
                      <span className="text-sm font-bold tracking-[2px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.word.mot}</span>
                      <span className="text-xs text-muted-foreground italic">{item.def}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col gap-2 mt-5">
              {sessionErrors.length > 0 && (
                <Button variant="outline" className="rounded-sm gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const reshuffled = shuffle(sessionErrors);
                    setDeck(reshuffled);
                    setIdx(0); setScore(0); setSessionErrors([]);
                    setInput(""); setShowHint(false); setLastResult(null);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}>
                  <RotateCcw className="w-4 h-4" /> Retravailler les erreurs
                </Button>
              )}
              <Button className="rounded-sm gap-2" onClick={() => restart()}>
                <ArrowRight className="w-4 h-4" /> Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Details */}
        <Separator className="mt-6 mb-3" />
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground italic hover:text-foreground transition-colors cursor-pointer py-1">
            <ChevronDown className={`w-3 h-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
            {detailsOpen ? "Masquer le détail" : "Tous les mots"}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ScrollArea className="h-72 mt-2">
              <div className="space-y-0">
                {sortedWords.map((w) => {
                  const s = stats[wordKey(w)] || { e: 0, s: 0 };
                  const t = s.e + s.s, pct = t > 0 ? Math.round(s.s / t * 100) : -1;
                  return (
                    <div key={wordKey(w)} className="flex items-center gap-2 py-1 border-b border-border text-xs">
                      <span className="min-w-[70px] font-bold tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{w.mot}</span>
                      <span className="flex-1 text-muted-foreground italic truncate">{w.defs[0]}</span>
                      <span className={`min-w-[30px] text-right text-[10px] font-bold ${
                        pct < 0 ? "text-muted-foreground/50" : pct >= 80 ? "text-[hsl(153,40%,30%)]" : pct >= 50 ? "text-muted-foreground" : "text-destructive"
                      }`}>{pct < 0 ? "—" : `${pct}%`}</span>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 text-xs text-destructive border-destructive rounded-sm"
                onClick={async () => { await save({}); restart(WORDS); }}>
                Réinitialiser les statistiques
              </Button>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
