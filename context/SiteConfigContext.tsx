"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { SiteConfig } from "@/types/site-config";
import { DEFAULT_CONFIG } from "@/lib/siteConfigDefaults";

const SiteConfigContext  = createContext<SiteConfig>(DEFAULT_CONFIG);
const EditorModeContext  = createContext<boolean>(false);
const InspectModeContext = createContext<boolean>(false);

export function useIsEditorMode() { return useContext(EditorModeContext); }
export function useInspectMode()  { return useContext(InspectModeContext); }

export function hexToRgbSpace(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "245 190 77";
  return `${r} ${g} ${b}`;
}

function applyTokens(tokens: SiteConfig["tokens"]) {
  const root = document.documentElement;
  root.style.setProperty("--c-yellow", hexToRgbSpace(tokens.yellow));
  root.style.setProperty("--c-purple", hexToRgbSpace(tokens.purple));
  root.style.setProperty("--c-dark",   hexToRgbSpace(tokens.dark));
}

function applyFonts(typography: SiteConfig["typography"]) {
  const root = document.documentElement;
  root.style.setProperty("--font-heading", `'${typography.headingFont}', Georgia, serif`);
  root.style.setProperty("--font-body",    `'${typography.bodyFont}', sans-serif`);

  const customFonts = [typography.headingFont, typography.bodyFont].filter(
    (f) => f !== "Inter" && f !== "Georgia" && f !== "Playfair Display"
  );
  if (customFonts.length > 0) {
    const families = customFonts.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;600;700;800`).join("&");
    const id = "editor-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }
}

interface Props {
  serverConfig: SiteConfig;
  children: ReactNode;
}

export function SiteConfigProvider({ serverConfig, children }: Props) {
  const [config, setConfig]           = useState<SiteConfig>(serverConfig);
  const [isEditorMode, setIsEditor]   = useState(false);
  const [inspectMode, setInspectMode] = useState(false);

  // Sync CSS vars from server config on first client paint
  useEffect(() => {
    applyTokens(config.tokens);
    applyFonts(config.typography);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for live preview updates from the page editor
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "INSPECT_MODE") {
        setInspectMode(event.data.enabled as boolean);
        return;
      }
      if (event.data?.type !== "CONFIG_PREVIEW") return;
      const next = event.data.config as SiteConfig;
      setConfig(next);
      setIsEditor(true);
      applyTokens(next.tokens);
      applyFonts(next.typography);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      <EditorModeContext.Provider value={isEditorMode}>
        <InspectModeContext.Provider value={inspectMode}>
          {children}
        </InspectModeContext.Provider>
      </EditorModeContext.Provider>
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig {
  return useContext(SiteConfigContext);
}
