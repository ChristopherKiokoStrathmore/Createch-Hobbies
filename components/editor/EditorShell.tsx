"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor, Tablet, Smartphone, Eye, Check, RotateCcw,
  Palette, Type, FileText, Layers, Search, Megaphone, Sliders,
  ChevronLeft, Loader2, Save, MousePointerClick,
} from "lucide-react";
import type { SiteConfig } from "@/types/site-config";
import { DEFAULT_CONFIG } from "@/lib/siteConfigDefaults";
import { useAdminAuth } from "@/context/AdminAuthContext";
import ColourPanel     from "./panels/ColourPanel";
import TypographyPanel from "./panels/TypographyPanel";
import ContentPanel    from "./panels/ContentPanel";
import SectionManager  from "./panels/SectionManager";
import SeoPanel        from "./panels/SeoPanel";
import BannerPanel     from "./panels/BannerPanel";
import ComponentStylePanel from "./panels/ComponentStylePanel";

type PreviewMode = "desktop" | "tablet" | "mobile";
type PanelId = "colours" | "typography" | "content" | "sections" | "seo" | "banner" | "style";

const PREVIEW_WIDTHS: Record<PreviewMode, string> = {
  desktop: "100%",
  tablet:  "768px",
  mobile:  "390px",
};

const PANELS: { id: PanelId; label: string; Icon: React.ElementType }[] = [
  { id: "colours",    label: "Colours",    Icon: Palette   },
  { id: "typography", label: "Typography", Icon: Type      },
  { id: "content",    label: "Content",    Icon: FileText  },
  { id: "sections",   label: "Sections",   Icon: Layers    },
  { id: "seo",        label: "SEO",        Icon: Search    },
  { id: "banner",     label: "Banner",     Icon: Megaphone },
  { id: "style",      label: "Style",      Icon: Sliders   },
];

export default function EditorShell() {
  const [config, setConfig]             = useState<SiteConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig]   = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [activePanel, setActivePanel]       = useState<PanelId>("colours");
  const [contentFocusTab, setContentFocusTab] = useState<string>("hero");
  const [previewMode, setPreviewMode]       = useState<PreviewMode>("desktop");
  const [inspectEnabled, setInspectEnabled] = useState(false);
  const [history, setHistory]           = useState<SiteConfig[]>([]);
  const [historyIdx, setHistoryIdx]     = useState(-1);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { pin }   = useAdminAuth();

  // Map data-editor-key values → panel + content tab
  const KEY_TO_PANEL: Record<string, PanelId> = {
    "hero.headline":    "content",
    "hero.subheadline": "content",
    "hero.cta":         "content",
    "nav":              "content",
    "banner":           "banner",
    "howItWorks":       "content",
    "howItWorks.steps": "content",
    "footer.tagline":   "content",
    "whatsapp":         "content",
    "trustBar":         "content",
    "whyCreatech":      "content",
    "testimonials":     "content",
    "whatsAppCTA":      "content",
    "newsletter":       "content",
    "seo":              "seo",
    "colours":          "colours",
    "cardStyle":        "style",
  };
  const KEY_TO_TAB: Record<string, string> = {
    "hero.headline":    "hero",
    "hero.subheadline": "hero",
    "hero.cta":         "hero",
    "nav":              "nav",
    "howItWorks":       "howitworks",
    "howItWorks.steps": "howitworks",
    "footer.tagline":   "footer",
    "whatsapp":         "whatsapp",
    "trustBar":         "trustbar",
    "whyCreatech":      "whycreatech",
    "testimonials":     "testimonials",
    "whatsAppCTA":      "wacta",
    "newsletter":       "wacta",
  };

  // Load config from the API
  useEffect(() => {
    fetch("/api/admin/site-config")
      .then(r => r.json())
      .then((data: SiteConfig) => {
        setConfig(data);
        setSavedConfig(data);
        setHistory([data]);
        setHistoryIdx(0);
      })
      .catch(() => {
        setConfig(DEFAULT_CONFIG);
        setSavedConfig(DEFAULT_CONFIG);
      })
      .finally(() => setLoading(false));
  }, []);

  // Post config to iframe on every change (debounced 150 ms)
  const postToIframe = useCallback((cfg: SiteConfig) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "CONFIG_PREVIEW", config: cfg },
      "*"
    );
  }, []);

  useEffect(() => {
    const id = setTimeout(() => postToIframe(config), 150);
    return () => clearTimeout(id);
  }, [config, postToIframe]);

  // Also post when iframe loads (it might load after config is set)
  const handleIframeLoad = useCallback(() => {
    setTimeout(() => {
      postToIframe(config);
      iframeRef.current?.contentWindow?.postMessage(
        { type: "INSPECT_MODE", enabled: inspectEnabled },
        "*"
      );
    }, 300);
  }, [config, postToIframe, inspectEnabled]);

  const updateConfig = useCallback((patch: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => {
    setConfig(prev => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      // Append to history, truncate forward history
      setHistory(h => [...h.slice(0, historyIdx + 1), next]);
      setHistoryIdx(i => i + 1);
      return next;
    });
  }, [historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prev = history[historyIdx - 1];
    setHistoryIdx(i => i - 1);
    setConfig(prev);
    postToIframe(prev);
  }, [history, historyIdx, postToIframe]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const next = history[historyIdx + 1];
    setHistoryIdx(i => i + 1);
    setConfig(next);
    postToIframe(next);
  }, [history, historyIdx, postToIframe]);

  // Keyboard undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Click-to-inspect: receive INSPECT_ELEMENT from preview iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "INSPECT_ELEMENT") return;
      const key   = e.data.key as string;
      const panel = KEY_TO_PANEL[key] ?? "content";
      const tab   = KEY_TO_TAB[key]   ?? "hero";
      setActivePanel(panel);
      if (panel === "content") setContentFocusTab(tab);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = JSON.stringify(config) !== JSON.stringify(savedConfig);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_KEY || pin,
        },
        body: JSON.stringify(config),
      });
      setSavedConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }, [config]);

  const publish = useCallback(async () => {
    await saveDraft();
    // Trigger ISR revalidation
    await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_KEY || pin },
    }).catch(() => {});
  }, [saveDraft]);

  const revert = useCallback(() => {
    setConfig(savedConfig);
    postToIframe(savedConfig);
    setHistory([savedConfig]);
    setHistoryIdx(0);
  }, [savedConfig, postToIframe]);

  const toggleInspect = useCallback(() => {
    setInspectEnabled(prev => !prev);
  }, []);

  // Sync inspect state to iframe whenever it changes
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "INSPECT_MODE", enabled: inspectEnabled },
      "*"
    );
  }, [inspectEnabled]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060410] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/40">
          <Loader2 className="animate-spin" size={32} />
          <span className="font-inter text-sm">Loading editor…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#060410] flex flex-col overflow-hidden">

      {/* ── Top bar ── */}
      <div className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-white/8 bg-[#0a0818]">
        {/* Back */}
        <a href="/admin" className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm font-inter">
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Admin</span>
        </a>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Title */}
        <span className="font-playfair font-bold text-white text-sm mr-auto">Page Editor</span>

        {/* Preview mode toggle */}
        <div className="hidden sm:flex items-center gap-0.5 bg-white/5 rounded-lg p-1">
          {(["desktop", "tablet", "mobile"] as PreviewMode[]).map((mode) => {
            const Icon = mode === "desktop" ? Monitor : mode === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`p-1.5 rounded-md transition-all ${previewMode === mode ? "bg-white/15 text-white" : "text-white/35 hover:text-white/60"}`}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>

        {/* Undo / redo */}
        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={historyIdx <= 0}
            className="p-1.5 text-white/35 hover:text-white disabled:opacity-20 transition-colors rounded"
            title="Undo (Ctrl+Z)">
            <RotateCcw size={14} />
          </button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1}
            className="p-1.5 text-white/35 hover:text-white disabled:opacity-20 transition-colors rounded rotate-180 scale-x-[-1]"
            title="Redo (Ctrl+Shift+Z)">
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Inspect toggle */}
        <button
          onClick={toggleInspect}
          title={inspectEnabled ? "Disable inspect mode" : "Enable inspect mode — click elements to edit"}
          className={`p-1.5 rounded-md transition-all ${
            inspectEnabled
              ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/40"
              : "text-white/35 hover:text-white/60"
          }`}
        >
          <MousePointerClick size={14} />
        </button>

        {/* Save draft */}
        <button
          onClick={saveDraft}
          disabled={saving || !isDirty}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-30 transition-all text-xs font-inter"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save draft
        </button>

        {/* Publish */}
        <button
          onClick={publish}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-yellow text-brand-dark font-semibold text-xs font-inter hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #f5be4d, #d4a030)", color: "#0a0a0f" }}
        >
          {saved ? (
            <><Check size={13} /> Published!</>
          ) : saving ? (
            <><Loader2 size={13} className="animate-spin" /> Publishing…</>
          ) : (
            <><Eye size={13} /> Publish</>
          )}
        </button>

        {isDirty && (
          <button onClick={revert} className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded" title="Revert to saved">
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0">

        {/* ── Left sidebar ── */}
        <div className="w-72 shrink-0 flex flex-col border-r border-white/8 bg-[#080614] overflow-hidden">

          {/* Panel tabs */}
          <div className="grid grid-cols-4 gap-px bg-white/5 border-b border-white/8 p-1">
            {PANELS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-md text-[10px] font-inter font-medium transition-all ${
                  activePanel === id
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
                title={label}
              >
                <Icon size={15} />
                <span className="hidden">{label}</span>
              </button>
            ))}
          </div>

          {/* Active panel label */}
          <div className="px-4 py-2.5 border-b border-white/5">
            <h3 className="text-white/50 font-inter text-xs uppercase tracking-widest">
              {PANELS.find(p => p.id === activePanel)?.label}
            </h3>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto scrollbar-none p-4">
            {activePanel === "colours"    && <ColourPanel     config={config} onChange={updateConfig} />}
            {activePanel === "typography" && <TypographyPanel config={config} onChange={updateConfig} />}
            {activePanel === "content"    && <ContentPanel    config={config} onChange={updateConfig} focusTab={contentFocusTab} />}
            {activePanel === "sections"   && <SectionManager  config={config} onChange={updateConfig} />}
            {activePanel === "seo"        && <SeoPanel        config={config} onChange={updateConfig} />}
            {activePanel === "banner"     && <BannerPanel     config={config} onChange={updateConfig} />}
            {activePanel === "style"      && <ComponentStylePanel config={config} onChange={updateConfig} />}
          </div>

          {/* Dirty indicator */}
          {isDirty && (
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-amber-400 font-inter">Unsaved changes</span>
              <button onClick={revert} className="text-[10px] text-white/30 hover:text-red-400 transition-colors font-inter">
                Revert
              </button>
            </div>
          )}
        </div>

        {/* ── Canvas ── */}
        <div className="flex-1 flex flex-col items-center bg-[#0d0b1a] p-4 overflow-auto">
          <div
            className="relative bg-white shadow-2xl shadow-black/50 transition-all duration-300 overflow-hidden"
            style={{
              width:    PREVIEW_WIDTHS[previewMode],
              minWidth: previewMode === "desktop" ? "0" : PREVIEW_WIDTHS[previewMode],
              height:   "100%",
              borderRadius: previewMode !== "desktop" ? "16px" : "8px",
            }}
          >
            <iframe
              ref={iframeRef}
              src="/"
              onLoad={handleIframeLoad}
              className="w-full h-full border-0"
              title="Site preview"
              aria-label="Site preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
