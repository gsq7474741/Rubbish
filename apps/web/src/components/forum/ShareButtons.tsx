"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  paperId?: string;
  venueSlug?: string;
}

export function ShareButtons({ title, paperId, venueSlug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const getUrl = () => {
    if (typeof window === "undefined") return "";
    if (paperId) return `${window.location.origin}/paper/${paperId}`;
    if (venueSlug) return `${window.location.origin}/venue/${venueSlug}`;
    return window.location.href;
  };

  const shareText = `${title} — RubbishReview`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const url = getUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
      } catch {
        // User cancelled or error - ignore
      }
    }
  };

  const twitterUrl = () =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`;

  const weiboUrl = () =>
    `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`;

  const redditUrl = () =>
    `https://www.reddit.com/submit?url=${encodeURIComponent(getUrl())}&title=${encodeURIComponent(shareText)}`;

  const btnClass =
    "text-xs bg-transparent border border-[#ccc] px-2 py-1 cursor-pointer hover:bg-[#f5f5f5]";
  const btnStyle = { borderRadius: 0, color: "var(--or-medium-blue)" } as const;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Native Share button (mobile/modern browsers) */}
      {canNativeShare && (
        <button onClick={handleNativeShare} className={btnClass} style={btnStyle}>
          <Share2 className="h-3 w-3 inline mr-1" />
          Share
        </button>
      )}
      <a href={twitterUrl()} target="_blank" rel="noopener noreferrer" className={btnClass} style={btnStyle}>
        𝕏 Twitter
      </a>
      <a href={weiboUrl()} target="_blank" rel="noopener noreferrer" className={btnClass} style={btnStyle}>
        微博
      </a>
      <a href={redditUrl()} target="_blank" rel="noopener noreferrer" className={btnClass} style={btnStyle}>
        Reddit
      </a>
      <button onClick={handleCopyLink} className={btnClass} style={btnStyle}>
        {copied ? <Check className="h-3 w-3 inline" /> : <Copy className="h-3 w-3 inline" />}
        {copied ? " Copied!" : " Copy Link"}
      </button>
    </div>
  );
}
