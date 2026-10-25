import React, { useState, useEffect } from 'react';
import { 
  Building2, AlertTriangle, FileText, CheckCircle2, ChevronRight, 
  ExternalLink, Sparkles, Shield, ArrowRight, RefreshCw, Eye
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { QuickClickCards } from './components/QuickClickCards';
import { FeatureBar } from './components/FeatureBar';
import { InstitutionDetail } from './components/InstitutionDetail';
import { OverlapModal } from './components/OverlapModal';
import { CoDocketWorkspace } from './components/CoDocketWorkspace';
import { AnalyticsView } from './components/AnalyticsView';
import { CaseRegister } from './components/CaseRegister';
import { Institution, CaseItem, PotentialOverlap, DashboardStats, CoDocketPack } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'institutions' | 'overlaps' | 'codockets' | 'analytics' | 'register'>('institutions');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [overlaps, setOverlaps] = useState<PotentialOverlap[]>([]);
  const [codockets, setCodockets] = useState<CoDocketPack[]>([]);

  // Selection states
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
  const [selectedOverlap, setSelectedOverlap] = useState<PotentialOverlap | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBureau, setSelectedBureau] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [statsRes, instRes, casesRes, overlapsRes, codocketsRes] = await Promise.all([
        fetch('/api/analytics/stats'),
        fetch('/api/institutions'),
        fetch('/api/cases'),
        fetch('/api/overlaps'),
        fetch('/api/codockets')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (instRes.ok) setInstitutions(await instRes.json());
      if (casesRes.ok) setCases(await casesRes.json());
      if (overlapsRes.ok) setOverlaps(await overlapsRes.json());
      if (codocketsRes.ok) setCodockets(await codocketsRes.json());
    } catch (err) {
      console.error('Error fetching CORD data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Scan overlaps dynamically
  const handleScanOverlaps = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/overlaps/scan', { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error scanning overlaps:', err);
    } finally {
      setScanning(false);
    }
  };

  // Review Overlap decisions
  const handleConfirmRelated = async (overlapId: number, note: string) => {
    await fetch(`/api/overlaps/${overlapId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CONFIRM_RELATED', note })
    });
    await fetchData();
  };

  const handleMarkUnrelated = async (overlapId: number, note: string) => {
    await fetch(`/api/overlaps/${overlapId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'MARK_UNRELATED', note })
    });
    await fetchData();
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBureau('All');
    setSelectedStatus('All');
  };

  // Filtered institutions
  const filteredInstitutions = institutions.filter(inst => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = inst.name.toLowerCase().includes(q);
      const pidMatch = inst.aicte_pid ? inst.aicte_pid.toLowerCase().includes(q) : false;
      const stateMatch = inst.state.toLowerCase().includes(q);
      if (!nameMatch && !pidMatch && !stateMatch) return false;
    }
    return true;
  });

  // Selected institution record
  const selectedInstitution = institutions.find(i => i.id === selectedInstitutionId);
  const selectedInstCases = selectedInstitutionId 
    ? cases.filter(c => c.institution_id === selectedInstitutionId)
    : [];
  const selectedInstOverlaps = selectedInstitutionId
    ? overlaps.filter(o => o.institution_id === selectedInstitutionId)
    : [];

  return (
    <div className="min-h-screen bg-[#EBF1F6] text-[#0F172A] flex flex-col antialiased selection:bg-[#7D2932] selection:text-white">
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 3-Minute Golden Demonstration Journey Helper Ribbon */}
      <div className="bg-[#FFFFFF] border-b border-[#D8D2A6] px-6 py-2 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase px-2 py-0.5 rounded bg-[#7D2932] text-white tracking-wider text-[10px]">
              Core 3-Minute Journey
            </span>
            <span className="font-bold text-[#0B2545]">
              Quick Demo Path:
            </span>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium overflow-x-auto">
              <span className="text-[#7D2932] font-bold">1. Demo Institute North</span>
              <span>➔</span>
              <span>2. Inspect Overlap (84% TF-IDF)</span>
              <span>➔</span>
              <span>3. Assemble Co-Docket™</span>
              <span>➔</span>
              <span>4. Sign Review Note</span>
              <span>➔</span>
              <span className="text-emerald-700 font-bold">5. Download PDF</span>
            </div>
          </div>

          <button
            onClick={() => {
              // Quick trigger Flagship Test Case Demo Institute North
              const demoInst = institutions.find(i => i.aicte_pid === 'DEMO-PID-104') || institutions[0];
              if (demoInst) {
                setSelectedInstitutionId(demoInst.id);
                setActiveTab('institutions');
              }
            }}
            className="text-[11px] font-black text-[#7D2932] hover:text-[#0B2545] underline decoration-[#7D2932] cursor-pointer self-start md:self-auto"
          >
            Click to Launch Flagship Test Case (`DEMO-PID-104`) →
          </button>
        </div>
      </div>

      {/* 2. ROW 1: "FEATURES EASY CLICK" (3 Quick-Click Metric Cards) */}
      <QuickClickCards
        stats={stats}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedInstitutionId(null);
          setSelectedPackId(null);
        }}
      />

      {/* 3. ROW 2: FEATURE BAR (Global Search & Filter Ribbon) */}
      <FeatureBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBureau={selectedBureau}
        onBureauChange={setSelectedBureau}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedInstitutionId(null);
          setSelectedPackId(null);
        }}
        onResetFilters={handleResetFilters}
        onScanOverlaps={handleScanOverlaps}
        scanning={scanning}
      />

      {/* 4. ROW 3: MAIN WORKSPACE WINDOW (Matching hand-drawn wireframe box) */}
      <main className="max-w-7xl mx-auto px-6 py-4 flex-1 w-full">
        <div className="bg-[#FFFFFF] border-2 border-[#D8D2A6] rounded-2xl p-6 shadow-sm min-h-[620px]">
          
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#7D2932] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#0F172A]">Loading AICTE CORD Central Registry...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: INSTITUTION EXPLORER */}
              {activeTab === 'institutions' && (
                selectedInstitution ? (
                  <InstitutionDetail
                    institution={selectedInstitution}
                    cases={selectedInstCases}
                    overlaps={selectedInstOverlaps}
                    onOpenOverlap={(overlap) => setSelectedOverlap(overlap)}
                    onOpenCoDocket={(packId) => {
                      setSelectedPackId(packId);
                      setActiveTab('codockets');
                    }}
                    onBackToList={() => setSelectedInstitutionId(null)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FEFCDF] pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#0B2545] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#7D2932]" />
                          Monitored Technical Institutions ({filteredInstitutions.length})
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Select an institution to inspect partitioned bureau cases and explainable overlap alerts
                        </p>
                      </div>

                      <span className="text-[11px] font-bold text-[#68611E] bg-[#FEFCDF] px-2.5 py-1 rounded border border-[#D8D2A6]">
                        GovTech Principle 2: Verified PID Primary Anchor
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredInstitutions.map((inst) => {
                        const isVerified = inst.verification_state === 'VERIFIED';
                        const instCases = cases.filter(c => c.institution_id === inst.id);
                        const instOverlaps = overlaps.filter(o => o.institution_id === inst.id && o.review_status !== 'MARKED_UNRELATED');

                        return (
                          <div
                            key={inst.id}
                            onClick={() => setSelectedInstitutionId(inst.id)}
                            className="bg-[#FFFFFF] hover:bg-[#FFFEF7] border border-[#D8D2A6] hover:border-[#7D2932] rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-1">
                                {isVerified ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E7F0ED] text-[#0f5132] border border-[#badbcc] flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    PID: {inst.aicte_pid}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#856404] border border-[#ffeeba] flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-[#b07d0a]" />
                                    ⚠ Identity Unverified
                                  </span>
                                )}

                                <span className="text-[10px] font-semibold text-slate-400">
                                  {inst.region} Region
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#7D2932] transition line-clamp-1">
                                {inst.name}
                              </h4>

                              <p className="text-xs text-slate-500 font-medium">
                                {inst.district}, {inst.state} · {inst.institution_type}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-semibold">
                                  {instCases.length} Cases
                                </span>
                                {instOverlaps.length > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#F3E5E4] text-[#7D2932] font-black text-[10px] flex items-center gap-0.5 border border-[#e2b8ba]">
                                    <AlertTriangle className="w-3 h-3" />
                                    {instOverlaps.length} Overlap
                                  </span>
                                )}
                              </div>

                              <span className="text-[#7D2932] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Inspect <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}

              {/* TAB 2: EXPLAINABLE OVERLAPS MATRIX */}
              {activeTab === 'overlaps' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FEFCDF] pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#7D2932] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#7D2932]" />
                        Active Cross-Bureau Overlaps Flagged ({overlaps.length})
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Explainable signals derived via verified PID matching and NLP TF-IDF cosine thematic similarity
                      </p>
                    </div>

                    <span className="text-[11px] font-bold text-[#68611E] bg-[#FEFCDF] px-2.5 py-1 rounded border border-[#D8D2A6]">
                      GovTech Principle 3: Explainable Matching Only (No Black Box)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overlaps.map((o) => {
                      const isPending = o.review_status === 'FLAGGED_PENDING_REVIEW';
                      const isConfirmed = o.review_status === 'CONFIRMED_RELATED';
                      const packId = `CORD-CD-${o.institution_id.toString().padStart(3, '0')}`;

                      return (
                        <div
                          key={o.id}
                          className="bg-[#FFFFFF] border-2 border-[#D8D2A6] hover:border-[#7D2932] rounded-xl p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#0B2545] truncate">
                                {o.institution_name}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                isPending
                                  ? 'bg-[#FEF3C7] text-[#68611E] border border-[#D8D2A6]'
                                  : isConfirmed
                                  ? 'bg-[#E7F0ED] text-[#0f5132] border border-[#badbcc]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {o.review_status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            {/* Overlap Matching Score Badge */}
                            <div className="bg-[#FEFCDF] p-2 rounded-lg border border-[#D8D2A6] flex items-center justify-between text-xs">
                              <span className="font-bold text-[#68611E]">
                                NLP TF-IDF Confidence:
                              </span>
                              <span className="font-black text-[#7D2932] text-sm">
                                {Math.round(o.tfidf_score * 100)}% Match
                              </span>
                            </div>

                            {/* Cases Involved */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-[#FFFEF7] p-2 rounded border border-slate-200">
                                <span className="text-[10px] font-bold text-[#0B2545] block">Case 1</span>
                                <span className="font-mono font-bold text-[#7D2932]">{o.source_case_id}</span>
                              </div>
                              <div className="bg-[#FFFEF7] p-2 rounded border border-slate-200">
                                <span className="text-[10px] font-bold text-[#0B2545] block">Case 2</span>
                                <span className="font-mono font-bold text-[#7D2932]">{o.candidate_case_id}</span>
                              </div>
                            </div>

                            {/* Rationale Bullet */}
                            <p className="text-xs text-slate-600 line-clamp-2 italic">
                              "{o.match_rationale}"
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setSelectedOverlap(o)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#7D2932] hover:bg-[#701A1E] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Overlap Evidence</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedPackId(packId);
                                setActiveTab('codockets');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#163a69] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <span>Co-Docket™</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: CO-DOCKET WORKSPACE */}
              {activeTab === 'codockets' && (
                selectedPackId ? (
                  <CoDocketWorkspace
                    packId={selectedPackId}
                    onBack={() => setSelectedPackId(null)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FEFCDF] pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#0B2545] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#7D2932]" />
                          CORD Co-Docket™ Review Dossiers ({codockets.length})
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Pre-compiled evidence review packs for joint regulatory hearings and official coordination notes
                        </p>
                      </div>

                      <span className="text-[11px] font-bold text-[#68611E] bg-[#FEFCDF] px-2.5 py-1 rounded border border-[#D8D2A6]">
                        GovTech Principle 6: Protected Context Receipts
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {codockets.map((pack) => (
                        <div
                          key={pack.id}
                          className="bg-[#FFFFFF] border-2 border-[#D8D2A6] hover:border-[#7D2932] rounded-xl p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-[#7D2932]">
                                {pack.pack_id}
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#FEF3C7] text-[#68611E] border border-[#D8D2A6]">
                                {pack.status}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#0F172A] leading-snug">
                              {pack.title}
                            </h4>

                            <div className="text-xs text-slate-600 font-medium">
                              Target Institution: <strong>{pack.institution_name}</strong> (PID: {pack.institution_pid})
                            </div>

                            <div className="bg-[#FFFEF7] p-2.5 rounded-lg border border-[#D8D2A6] text-xs space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Linked Matters:</span>
                              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                                <span className="bg-[#FEFCDF] px-1.5 py-0.5 rounded border border-[#D8D2A6] text-[#0B2545]">
                                  {pack.primary_case_id}
                                </span>
                                {pack.related_case_ids?.map((cid) => (
                                  <span key={cid} className="bg-[#F3E5E4] px-1.5 py-0.5 rounded border border-[#e2b8ba] text-[#7D2932]">
                                    {cid}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Lead: {pack.lead_bureau}
                            </span>

                            <button
                              onClick={() => setSelectedPackId(pack.pack_id)}
                              className="px-4 py-1.5 rounded-lg bg-[#7D2932] hover:bg-[#701A1E] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <span>Open Review Pack</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* TAB 4: DASHBOARD ANALYTICS */}
              {activeTab === 'analytics' && (
                <AnalyticsView stats={stats} />
              )}

              {/* TAB 5: FULL CASE REGISTER */}
              {activeTab === 'register' && (
                <CaseRegister
                  cases={cases}
                  institutions={institutions}
                  onSelectInstitution={(instId) => {
                    setSelectedInstitutionId(instId);
                    setActiveTab('institutions');
                  }}
                />
              )}
            </>
          )}

        </div>
      </main>

      {/* Overlap Inspection Modal */}
      {selectedOverlap && (
        <OverlapModal
          overlap={selectedOverlap}
          onClose={() => setSelectedOverlap(null)}
          onConfirmRelated={handleConfirmRelated}
          onMarkUnrelated={handleMarkUnrelated}
          onProceedToCoDocket={(packId) => {
            setSelectedOverlap(null);
            setSelectedPackId(packId);
            setActiveTab('codockets');
          }}
        />
      )}

      {/* FOOTER */}
      <footer className="mt-auto bg-[#0B2545] text-white py-4 px-6 border-t-2 border-[#7D2932] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#FEF3C7]">CORD Architecture</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">All India Council for Technical Education (AICTE)</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">GovTech Compliance 2026</span>
          </div>

          <p className="text-[11px] text-slate-300 text-center md:text-right font-medium">
            Strict Non-Destructive Intelligence · Zero Ticket Auto-Merges · Sovereign Cell Authorities Intact
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
