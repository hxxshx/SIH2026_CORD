import React from 'react';
import { Building2, AlertTriangle, FileCheck2, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../types';

interface QuickClickCardsProps {
  stats: DashboardStats | null;
  activeTab: 'institutions' | 'overlaps' | 'codockets' | 'analytics' | 'register';
  onSelectTab: (tab: 'institutions' | 'overlaps' | 'codockets' | 'analytics' | 'register') => void;
}

export const QuickClickCards: React.FC<QuickClickCardsProps> = ({
  stats,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'institutions' as const,
      label: 'All Monitored Institutions',
      value: stats?.cards.monitored_institutions?.toLocaleString() || '1,420',
      subtitle: `${stats?.cards.institutions_active_here || 8} Seeded in Demo · 100% Verified Primary Anchors`,
      icon: Building2,
      accentBorder: 'border-l-4 border-l-[#0B2545]',
      badgeColor: 'bg-[#FEFCDF] text-[#0B2545] border-[#D8D2A6]',
      actionHint: 'Click to explore institution profiles & side-by-side bureau records'
    },
    {
      id: 'overlaps' as const,
      label: 'Cross-Bureau Overlaps Flagged',
      value: stats?.cards.cross_bureau_overlaps_flagged?.toString() || '38',
      subtitle: `${stats?.cards.overlaps_pending_here || 4} Active AICTE Overlaps · Explainable TF-IDF Matches`,
      icon: AlertTriangle,
      accentBorder: 'border-l-4 border-l-[#7D2932]',
      badgeColor: 'bg-[#F3E5E4] text-[#7D2932] border-[#e2b8ba]',
      actionHint: 'Click to inspect explainable signals (PID + Intake/Fee Similarity)'
    },
    {
      id: 'codockets' as const,
      label: 'Co-Docket™ Review Packs',
      value: stats?.cards.codocket_review_packs?.toString() || '12',
      subtitle: `${stats?.cards.codockets_here || 1} Ready Dossiers · Timestamped Context Receipts`,
      icon: FileCheck2,
      accentBorder: 'border-l-4 border-l-[#68611E]',
      badgeColor: 'bg-[#FEF3C7] text-[#68611E] border-[#D8D2A6]',
      actionHint: 'Click to assemble evidence pack, sign review note & download PDF'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#68611E] bg-[#FEFCDF] px-2.5 py-0.5 rounded border border-[#D8D2A6]">
            Row 1 · Features Easy Click
          </span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            Direct navigation across core AICTE monitoring operational streams
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeTab === card.id;

          return (
            <button
              key={card.id}
              onClick={() => onSelectTab(card.id)}
              className={`text-left rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group
                ${isSelected 
                  ? 'bg-[#FFFFFF] border-2 border-[#7D2932] shadow-md ring-2 ring-[#7D2932]/20' 
                  : 'bg-[#FFFFFF] hover:bg-[#FFFEF7] border border-[#D8D2A6] hover:border-[#7D2932]/60'
                } ${card.accentBorder}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-[#68611E] tracking-tight block mb-1">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-black text-[#0B2545] tracking-tight">
                      {card.value}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Active
                    </span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg border ${card.badgeColor} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">
                  {card.subtitle}
                </span>
                <span className="text-[#7D2932] font-bold flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                  Open <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
