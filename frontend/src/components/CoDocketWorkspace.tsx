import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, Download, ShieldCheck, CheckCircle2, Lock, 
  Clock, Hash, UserCheck, AlertTriangle, Scale, ArrowLeft,
  FileText, ExternalLink, RefreshCw
} from 'lucide-react';
import { CoDocketPack, CoDocketReceiptItem, CaseItem } from '../types';

interface CoDocketWorkspaceProps {
  packId: string;
  onBack: () => void;
}

export const CoDocketWorkspace: React.FC<CoDocketWorkspaceProps> = ({
  packId,
  onBack
}) => {
  const [packData, setPackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [coordinationAction, setCoordinationAction] = useState('Joint Inquiry & Show-Cause Alignment');
  const [submitting, setSubmitting] = useState(false);
  const [savedReceipt, setSavedReceipt] = useState<CoDocketReceiptItem | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fetchPackDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/codockets/${packId}`);
      if (res.ok) {
        const data = await res.json();
        setPackData(data);
        if (data.receipts && data.receipts.length > 0) {
          setSavedReceipt(data.receipts[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching CoDocket details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackDetails();
  }, [packId]);

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNote.trim()) {
      alert('Please enter an official review note before recording the receipt.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/codockets/${packId}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: packId,
          review_note: reviewNote,
          reviewer: 'Officer R. Sharma | Regulation Bureau (HQ-Delhi)',
          coordination_action: coordinationAction
        })
      });

      if (res.ok) {
        const result = await res.json();
        setSavedReceipt({
          receipt_id: result.receipt_id,
          review_note: result.review_note,
          reviewer: result.reviewer,
          timestamp: result.timestamp,
          hash_signature: result.hash_signature,
          coordination_action: result.coordination_action
        });
        setReviewNote('');
        fetchPackDetails();
      }
    } catch (err) {
      console.error('Error recording receipt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/codockets/${packId}/pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CORD_CoDocket_${packId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading CoDocket PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] border-2 border-[#D8D2A6] rounded-2xl p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#7D2932] animate-spin mx-auto" />
        <p className="text-xs font-bold text-[#0F172A]">Assembling Co-Docket™ Review Pack...</p>
      </div>
    );
  }

  if (!packData) {
    return (
      <div className="bg-[#FFFFFF] border-2 border-[#D8D2A6] rounded-2xl p-8 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-[#7D2932] mx-auto" />
        <p className="text-xs font-bold text-[#0F172A]">Co-Docket {packId} not found or awaiting initialization.</p>
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#7D2932] hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { pack, institution, cases, overlap_signals, receipts } = packData;

  return (
    <div className="space-y-5">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="text-xs font-bold text-[#7D2932] hover:text-[#0B2545] flex items-center gap-1 transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Co-Docket Dossiers</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#68611E] border border-[#D8D2A6]">
            Dossier ID: {pack.pack_id}
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#E7F0ED] text-[#0f5132] border border-[#badbcc]">
            Status: {pack.status}
          </span>
        </div>
      </div>

      {/* Main Dossier Card */}
      <div className="bg-[#FFFFFF] border-2 border-[#7D2932] rounded-2xl shadow-md overflow-hidden">
        
        {/* Dossier Header Banner */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#163a69] to-[#7D2932] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#0B2545] font-black text-xs uppercase tracking-wider">
                CORD Co-Docket™
              </span>
              <span className="text-xs text-slate-200">
                Official Evidence-Backed Coordination Pack
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {pack.title}
            </h2>
            <p className="text-xs text-[#FEFCDF] font-medium">
              Target Institution: <span className="font-bold underline">{institution.name}</span> · Verified PID: <span className="font-mono font-bold">{institution.aicte_pid}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-4 py-2.5 rounded-xl bg-[#FEFCDF] text-[#7D2932] hover:bg-[#FFFFFF] text-xs font-black transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'Compiling PDF...' : 'Download Co-Docket PDF'}</span>
            </button>
          </div>
        </div>

        {/* Dossier Workspace Content */}
        <div className="p-6 space-y-6 bg-[#FFFEF7]">
          
          {/* Step 1: Explainable Overlap Signals Summary */}
          <div className="bg-[#FEFCDF] border border-[#D8D2A6] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#7D2932] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#68611E]" />
                1. Assembled Overlap Evidence & Matching Rationale
              </h4>
              <span className="text-[11px] font-bold text-[#68611E]">
                Scikit-Learn TF-IDF: {Math.round(overlap_signals.tfidf_score * 100)}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {overlap_signals.rationale_list?.map((r: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-white px-3 py-2 rounded-lg border border-[#D8D2A6] text-xs font-semibold text-[#0F172A] flex items-center gap-1.5"
                >
                  <span className="text-[#7D2932] font-black">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Linked Cross-Bureau Matters (Side-by-Side Chronology) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#0B2545]">
                2. Linked Cross-Bureau Matters (Zero Destructive Auto-Merges)
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                Individual Bureau Ownership Remains Intact
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map((c: CaseItem) => (
                <div
                  key={c.synthetic_case_id}
                  className="bg-[#FFFFFF] border-2 border-[#D8D2A6] rounded-xl p-4 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-[#FEFCDF] text-[#68611E] border border-[#D8D2A6]">
                      {c.bureau_code}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#7D2932]">
                      {c.synthetic_case_id}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-[#0F172A] leading-snug">
                    {c.subject}
                  </h5>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {c.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Status: <strong className="text-[#0B2545]">{c.status}</strong></span>
                    <span>Assigned: {c.officer_assigned.split('(')[0]}</span>
                    <span>{c.days_open}d open</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Officer Review Note & Timestamped Snapshot Recording */}
          <div className="bg-[#FFFFFF] border-2 border-[#7D2932] rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#F3E5E4] text-[#7D2932]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-[#7D2932]">
                    3. Record Official Review Note & Context Receipt
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Saves a cryptographic, timestamped snapshot of the displayed context and decision.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#0F172A] block">Officer: R. Sharma</span>
                <span className="text-[11px] text-[#68611E]">Under Secretary, Regulation Bureau</span>
              </div>
            </div>

            <form onSubmit={handleSaveReceipt} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Action Recommendation:
                </label>
                <select
                  value={coordinationAction}
                  onChange={(e) => setCoordinationAction(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-[#FFFEF7] border border-[#D8D2A6] text-[#0F172A] focus:ring-2 focus:ring-[#7D2932] focus:outline-none"
                >
                  <option value="Joint Inquiry & Show-Cause Alignment">Joint Inquiry & Show-Cause Alignment</option>
                  <option value="Inter-Bureau Evidence Sharing (PGRC + Regulation)">Inter-Bureau Evidence Sharing (PGRC + Regulation)</option>
                  <option value="Summon Joint Management Committee Hearing">Summon Joint Management Committee Hearing</option>
                  <option value="Coordinate Regional Office Surprise Verification">Coordinate Regional Office Surprise Verification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Official Regulatory Review Findings & Decision Note:
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  required
                  placeholder="Record formal review assessment: (e.g. Reviewed student complaints on fee irregularities alongside show-cause on unauthorized 60-seat expansion. Discrepancies corroborate student evidence. Recommended issuing joint inquiry memo to institution management within 10 days.)..."
                  className="w-full text-xs p-3 rounded-lg bg-[#FFFEF7] border border-[#D8D2A6] text-[#0F172A] focus:ring-2 focus:ring-[#7D2932] focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Protected under AICTE GovTech Cryptographic Integrity Protocol
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg bg-[#7D2932] hover:bg-[#701A1E] text-white text-xs font-black transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'Recording Snapshot...' : 'Save Review Note & Record Receipt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="px-4 py-2.5 rounded-lg bg-[#0B2545] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-[#38bdf8]" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Protected Context Receipt Snapshot Box (Requirement 6 & Acceptance Criterion 10) */}
          {savedReceipt && (
            <div className="bg-[#E7F0ED] border-2 border-[#badbcc] rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#badbcc] pb-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#0f5132]">
                  <CheckCircle2 className="w-4 h-4 text-[#0f5132]" />
                  <span>Co-Docket™ Context Receipt Successfully Protected</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#0f5132]">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Receipt ID: {savedReceipt.receipt_id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Cryptographic Signature</span>
                  <p className="font-mono font-bold text-[#0B2545] text-[11px] truncate">
                    {savedReceipt.hash_signature}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Timestamp</span>
                  <p className="font-medium text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {savedReceipt.timestamp}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Recorded Decision</span>
                  <p className="font-bold text-[#7D2932]">
                    {savedReceipt.coordination_action}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-[#badbcc]">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Officer Note Entered:</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed italic">
                  "{savedReceipt.review_note}"
                </p>
              </div>
            </div>
          )}

          {/* Historical Receipts list */}
          {receipts && receipts.length > 1 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase text-[#68611E]">
                Previous Coordination Receipt Records ({receipts.length})
              </h5>
              <div className="space-y-2">
                {receipts.slice(1).map((r: any, idx: number) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-[#D8D2A6] text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#0F172A]">{r.coordination_action}</span>
                      <p className="text-slate-500 text-[11px]">{r.review_note}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <span>{r.timestamp}</span>
                      <span className="block font-mono text-[10px]">{r.hash_signature}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* GovTech Defensibility Footer (Prompt Principle 5) */}
        <div className="bg-[#FEFCDF] border-t-2 border-[#D8D2A6] p-4 text-center space-y-1">
          <p className="text-xs font-bold text-[#7D2932]">
            “Officials retain decision authority. Cases are never auto-merged.”
          </p>
          <p className="text-[11px] text-slate-600 font-medium">
            CORD Co-Docket™ is a coordination intelligence artifact. Case ownership remains strictly distinct with respective Bureaus.
          </p>
        </div>

      </div>
    </div>
  );
};
