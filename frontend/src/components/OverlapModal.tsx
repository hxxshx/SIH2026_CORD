import React, { useState } from 'react';
import { 
  X, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, 
  Scale, FileCheck, Check, Sparkles, Building2, User
} from 'lucide-react';
import { PotentialOverlap } from '../types';

interface OverlapModalProps {
  overlap: PotentialOverlap;
  onClose: () => void;
  onConfirmRelated: (overlapId: number, note: string) => Promise<void>;
  onMarkUnrelated: (overlapId: number, note: string) => Promise<void>;
  onProceedToCoDocket: (packId: string) => void;
}

export const OverlapModal: React.FC<OverlapModalProps> = ({
  overlap,
  onClose,
  onConfirmRelated,
  onMarkUnrelated,
  onProceedToCoDocket
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decisionDone, setDecisionDone] = useState(overlap.review_status !== 'FLAGGED_PENDING_REVIEW');
  const [currentStatus, setCurrentStatus] = useState(overlap.review_status);

  const handleAction = async (action: 'CONFIRM' | 'DISMISS') => {
    setSubmitting(true);
    try {
      if (action === 'CONFIRM') {
        await onConfirmRelated(overlap.id, reviewNote || 'Confirmed related matter for joint AICTE coordination.');
        setCurrentStatus('CONFIRMED_RELATED');
      } else {
        await onMarkUnrelated(overlap.id, reviewNote || 'Marked unrelated matter upon official human review.');
        setCurrentStatus('MARKED_UNRELATED');
      }
      setDecisionDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const packId = `CORD-CD-${overlap.institution_id.toString().padStart(3, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B2545]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border-2 border-[#7D2932] rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#163a69] to-[#7D2932] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 border border-white/20">
              <ShieldAlert className="w-5 h-5 text-[#FEF3C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FEF3C7] tracking-wider uppercase">
                  CORD Explainable Overlap Engine
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/20 text-white">
                  NLP Cosine Score: {Math.round(overlap.tfidf_score * 100)}%
                </span>
              </div>
              <h3 className="text-lg font-bold">
                Cross-Bureau Matter Inspection: {overlap.institution_name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto bg-[#FFFEF7]">
          
          {/* Explainable Signals Box (Prompt Section 3 & 6 requirement: NEVER BLACK-BOX) */}
          <div className="bg-[#FEFCDF] border-2 border-[#D8D2A6] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#7D2932] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#68611E]" />
                Explainable Matching Evidence & Rationale
              </h4>
              <span className="text-[11px] font-semibold text-[#68611E]">
                Defensible Deterministic + TF-IDF Model
              </span>
            </div>

            <div className="space-y-2">
              {overlap.rationale_list && overlap.rationale_list.length > 0 ? (
                overlap.rationale_list.map((r, idx) => (
                  <div
                    key={idx}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                      r.includes('✓')
                        ? 'bg-[#E7F0ED] text-[#0f5132] border-[#badbcc]'
                        : 'bg-[#F3E5E4] text-[#7D2932] border-[#e2b8ba]'
                    }`}
                  >
                    <span>{r}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#0F172A] font-medium p-2 bg-white rounded border border-[#D8D2A6]">
                  {overlap.match_rationale}
                </div>
              )}
            </div>
          </div>

          {/* Side-by-Side Case Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Case A: Source Case (e.g. PGRC) */}
            <div className="bg-[#FFFFFF] border-2 border-[#0B2545]/20 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#68611E] border border-[#D8D2A6]">
                  {overlap.source_case?.bureau_code || 'Source Bureau'}
                </span>
                <span className="text-xs font-mono font-bold text-[#0B2545]">
                  {overlap.source_case_id}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category</span>
                <p className="text-xs font-bold text-[#0F172A]">{overlap.source_case?.category}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject</span>
                <p className="text-xs font-semibold text-[#7D2932]">{overlap.source_case?.subject}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Summary Excerpt</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-[#FEFCDF]/50 p-2 rounded border border-[#D8D2A6]">
                  {overlap.source_case?.summary}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Status: <strong className="text-[#0B2545]">{overlap.source_case?.status}</strong></span>
                <span>Open: {overlap.source_case?.days_open}d</span>
              </div>
            </div>

            {/* Case B: Candidate Case (e.g. Regulation Bureau) */}
            <div className="bg-[#FFFFFF] border-2 border-[#7D2932]/30 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#F3E5E4] text-[#7D2932] border border-[#e2b8ba]">
                  {overlap.candidate_case?.bureau_code || 'Candidate Bureau'}
                </span>
                <span className="text-xs font-mono font-bold text-[#7D2932]">
                  {overlap.candidate_case_id}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category</span>
                <p className="text-xs font-bold text-[#0F172A]">{overlap.candidate_case?.category}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject</span>
                <p className="text-xs font-semibold text-[#7D2932]">{overlap.candidate_case?.subject}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Summary Excerpt</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-[#F3E5E4]/30 p-2 rounded border border-[#e2b8ba]">
                  {overlap.candidate_case?.summary}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Status: <strong className="text-[#7D2932]">{overlap.candidate_case?.status}</strong></span>
                <span>Open: {overlap.candidate_case?.days_open}d</span>
              </div>
            </div>

          </div>

          {/* Principle 4 Banner */}
          <div className="bg-[#FEFCDF] border border-[#D8D2A6] rounded-xl p-3 flex items-start gap-2 text-xs text-[#68611E]">
            <Scale className="w-4 h-4 text-[#7D2932] shrink-0 mt-0.5" />
            <div>
              <strong>GovTech Sovereign Rule:</strong> Confirming coordination links the matters into an evidence dossier for joint review. It will <u>never</u> merge or overwrite original case records or bureau authorities.
            </div>
          </div>

          {/* Review Decision Controls */}
          {!decisionDone ? (
            <div className="bg-white border border-[#D8D2A6] rounded-xl p-4 space-y-3">
              <label className="block text-xs font-bold text-[#0F172A]">
                Official Preliminary Assessment Note (Optional):
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={2}
                placeholder="Enter regulatory reasoning (e.g., Confirmed student fee complaint correlates with unapproved intake audit)..."
                className="w-full text-xs p-2.5 rounded-lg border border-[#D8D2A6] bg-[#FFFEF7] focus:ring-2 focus:ring-[#7D2932] focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAction('DISMISS')}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  Mark Unrelated (Dismiss Flag)
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAction('CONFIRM')}
                  className="px-5 py-2 rounded-lg bg-[#7D2932] hover:bg-[#701A1E] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Related for Coordination</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#E7F0ED] border border-[#badbcc] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0f5132]">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Decision Recorded: {currentStatus === 'CONFIRMED_RELATED' ? 'Confirmed Related for Multi-Bureau Coordination' : 'Marked Unrelated'}
                </span>
              </div>

              {currentStatus === 'CONFIRMED_RELATED' && (
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCoDocket(packId);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0B2545] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-[#38bdf8]" />
                  <span>Open CORD Co-Docket™ Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#FFFFFF] border-t border-[#D8D2A6] px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>CORD Decision Governance Standard · Zero Destructive Auto-Merges</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#7D2932] hover:underline cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
