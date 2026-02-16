"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function DashboardTabs({ tabs, defaultTab }: { tabs: Tab[]; defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  return (
    <div>
      {/* Tab headers */}
      <div className="flex items-center gap-0 border-b border-[rgba(0,0,0,0.1)] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 text-sm border-0 cursor-pointer bg-transparent"
            style={{
              color: activeTab === tab.id ? "var(--or-green)" : "var(--or-medium-blue)",
              fontWeight: activeTab === tab.id ? 600 : 400,
              borderBottom: activeTab === tab.id ? "2px solid var(--or-green)" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabs.map((tab) => (
        <div key={tab.id} style={{ display: activeTab === tab.id ? "block" : "none" }}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
