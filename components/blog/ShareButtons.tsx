"use client";

import { useState } from "react";
import { MessageCircle, Twitter, Link2, Check } from "lucide-react";

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-white/30 text-sm font-inter">Share:</span>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
        className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-white/40 hover:text-green-400 transition-all"
      >
        <MessageCircle size={16} />
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X"
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
      >
        <Twitter size={16} />
      </a>
      <button
        onClick={copyLink}
        title="Copy link"
        className="p-2 rounded-lg bg-white/5 hover:bg-brand-yellow/10 text-white/40 hover:text-brand-yellow transition-all"
      >
        {copied ? <Check size={16} className="text-brand-yellow" /> : <Link2 size={16} />}
      </button>
      {copied && (
        <span className="text-brand-yellow text-xs font-inter">Copied!</span>
      )}
    </div>
  );
}
