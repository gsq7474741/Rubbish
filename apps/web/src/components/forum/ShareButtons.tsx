"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  paperId: string;
}

export function ShareButtons({ title, paperId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/paper/${paperId}`
      : `https://rubbishreview.org/paper/${paperId}`;

  const shareText = `${title} — RubbishReview`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
