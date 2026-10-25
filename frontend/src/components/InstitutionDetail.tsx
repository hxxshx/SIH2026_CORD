import React from 'react';
import { 
  Building, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert,
  Clock, FileText, User, ChevronRight, Scale, ExternalLink
} from 'lucide-react';
import { Institution, CaseItem, PotentialOverlap } from '../types';

interface InstitutionDetailProps {
  institution: Institution;
  cases: CaseItem[];
  overlaps: PotentialOverlap[];
  onOpenOverlap: (overlap: PotentialOverlap) => void;
  onOpenCoDocket: (packId: string) => void;
  onBackToList: () => void;
}

export const InstitutionDetail: React.FC<InstitutionDetailProps> = ({
  institution,
  cases,
  overlaps,
  onOpenOverlap,
  onOpenCoDocket,
  onBackToList
}) => {
  const isVerified = institution.verification_state === 'VERIFIED';
  
  // Find active overlaps for this college
  const activeOverlaps = overlaps.filter(o => o.review_status !== 'MARKED_UNRELATED');

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToList}
          className="text-xs font-bold text-[#7D2932] hover:text-[#0B2545] flex items-center gap-1 transition cursor-pointer"
        >
          ← Back to Monitored Institutions Directory
        </button>
        <span className="text-xs text-slate-500 font-medium">
          Institution Anchor View · Single Unified Record Window
        </span>
      </div>

      {/* Institution Master Header Banner */}
      <div className="bg-[#FFFFFF] border-2 border-[#D8D2A6] rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-[#FEFCDF] text-[#68611E] border border-[#D8D2A6]">
                {institution.institution_type}
              </span>
              
              {/* PID Verification Status Pill */}
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded bg-[#E7F0ED] text-[#0f5132] border border-[#badbcc]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified PID: {institution.aicte_pid}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#856404] border border-[#ffeeba]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#b07d0a]" />
                  ⚠ Identity Unverified - Human Validation Required (Fuzzy Matched)
                </span>
              )}

              <span className="text-xs text-slate-500 font-medium">
                Region: {institution.region} ({institution.district}, {institution.state})
              </span>
            </div>

            <h2 className="text-2xl font-black text-[#0B2545] tracking-tight">
              {institution.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Permanent Institutional Record · Governed under AICTE Technical Regulations
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="bg-[#FEFCDF] border border-[#D8D2A6] rounded-xl px-4 py-2 text-center">
              <span className="text-xs text-[#68611E] font-bold block">Active Cases</span>
              <span className="text-xl font-black text-[#0B2545]">{cases.length}</span>
            </div>

            <div className="bg-[#F3E5E4] border border-[#e2b8ba] rounded-xl px-4 py-2 text-center">
              <span className="text-xs text-[#7D2932] font-bold block">Flagged Overlaps</span>
              <span className="text-xl font-black text-[#7D2932]">{activeOverlaps.length}</span>
            </div>
          </div>
        </div>

        {/* Flagged Overlap Prominent Callout Banner */}
        {activeOverlaps.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#D8D2A6] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FFFDF0] p-3.5 rounded-xl border border-[#e2b8ba]">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#F3E5E4] text-[#7D2932] mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-[#7D2932] uppercase tracking-wide flex items-center gap-1.5">
                  Cross-Bureau Overlap Detected · Explainable Signals Ready
                </h4>
                <p className="text-xs text-[#0F172A] font-medium mt-0.5">
                  Active matters in <span className="font-bold underline decoration-[#7D2932]">Regulation Bureau</span> and <span className="font-bold underline decoration-[#7D2932]">PGRC</span> share matching PID and high TF-IDF thematic overlap (84%).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenOverlap(activeOverlaps[0])}
                className="px-3.5 py-1.5 rounded-lg bg-[#7D2932] hover:bg-[#701A1E] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Inspect Overlap Evidence</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onOpenCoDocket(`CORD-CD-${institution.id.toString().padStart(3, '0')}`)}
                className="px-3 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Assemble Co-Docket™</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#38bdf8]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Principle Reminder Banner */}
      <div className="bg-[#FEFCDF] border border-[#D8D2A6] rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-[#68611E] font-medium">
        <Scale className="w-4 h-4 text-[#7D2932] shrink-0" />
        <span>
          <strong>GovTech Principle 1 & 4 in Action:</strong> Institution identity is NOT issue identity. Notice how routine or unrelated matters (like boundary wall demarcation) share the PID but remain strictly separate with zero destructive auto-merges.
        </span>
      </div>

      {/* Cases Partitioned by Bureau Ownership */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#7D2932] flex items-center gap-2">
            <span>Assembled Bureau Case Records ({cases.length})</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            Sovereign Bureau Cell Ownership Preserved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c) => {
            const isDisposed = c.status.toLowerCase().includes('disposed');
            const isShowCause = c.status.toLowerCase().includes('show-cause');
            const isPgrc = c.bureau_code.toLowerCase().includes('pgrc');

            return (
              <div
                key={c.id}
                className={`rounded-xl p-4.5 border transition shadow-sm flex flex-col justify-between ${
                  isDisposed
                    ? 'bg-[#FFFEF7] border-slate-200 opacity-85'
                    : isShowCause
                    ? 'bg-[#FFFFFF] border-[#e2b8ba] ring-1 ring-[#7D2932]/10'
                    : 'bg-[#FFFFFF] border-[#D8D2A6]'
                }`}
              >
                <div>
                  {/* Bureau & Status Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${
                        isPgrc
                          ? 'bg-[#FEF3C7] text-[#68611E] border-[#D8D2A6]'
                          : isShowCause
                          ? 'bg-[#F3E5E4] text-[#7D2932] border-[#e2b8ba]'
                          : 'bg-[#E7F0ED] text-[#0f5132] border-[#badbcc]'
                      }`}>
                        {c.bureau_code}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#0B2545]">
                        {c.synthetic_case_id}
                      </span>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isDisposed
                        ? 'bg-slate-100 text-slate-600'
                        : isShowCause
                        ? 'bg-[#7D2932] text-white'
                        : 'bg-[#0B2545] text-white'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  {/* Subject & Category */}
                  <h4 className="text-sm font-bold text-[#0F172A] leading-snug mb-1">
                    {c.subject}
                  </h4>
                  <p className="text-xs text-[#68611E] font-semibold mb-2">
                    Category: {c.category}
                  </p>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                    {c.summary}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      {c.officer_assigned.split('(')[0].trim()}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {c.days_open}d open
                    </span>
                  </div>

                  {isDisposed && (
                    <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Unrelated · Demarcation
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
