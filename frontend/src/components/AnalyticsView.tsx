import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Clock, AlertTriangle, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { DashboardStats } from '../types';

interface AnalyticsViewProps {
  stats: DashboardStats | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  if (!stats) return null;

  const bureauData = stats.cases_by_bureau.map(b => ({
    name: b.bureau.replace('Bureau', 'Bur.').replace('Public Grievance Redressal', 'PGRC'),
    cases: b.cases
  }));

  const ageingData = stats.ageing_distribution.map(a => ({
    name: a.bracket,
    cases: a.count
  }));

  const overlapData = [
    { name: 'Pending Review', value: stats.overlap_metrics.pending_review, color: '#f59e0b' },
    { name: 'Confirmed Related', value: stats.overlap_metrics.confirmed_related, color: '#7D2932' },
    { name: 'Marked Unrelated', value: stats.overlap_metrics.marked_unrelated, color: '#64748b' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#D8D2A6] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#68611E] bg-[#FEFCDF] px-2.5 py-0.5 rounded border border-[#D8D2A6]">
            AICTE Cross-Bureau Intelligence
          </span>
          <h2 className="text-xl font-black text-[#0B2545] tracking-tight mt-1">
            Grievance Ageing, Cell Caseload & Overlap Resolution
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Real-time monitoring across Regulation Bureau, PGRC, Approval Bureau, and Regional Offices
          </p>
        </div>

        <a
          href="/api/reports/cases.csv"
          download
          className="px-4 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#163a69] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer self-start md:self-center"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#38bdf8]" />
          <span>Export Master CSV Register</span>
        </a>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Chart 1: Cases by Bureau */}
        <div className="bg-[#FFFFFF] border border-[#D8D2A6] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#7D2932] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#7D2932]" />
              Active Cases by AICTE Bureau / Cell
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Cross-Cell Caseload</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ebd8" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#0F172A' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#0F172A' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFEF7', borderColor: '#D8D2A6', borderRadius: 8, fontSize: 12 }} 
                />
                <Bar dataKey="cases" fill="#0B2545" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ageing Distribution Histogram */}
        <div className="bg-[#FFFFFF] border border-[#D8D2A6] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#68611E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#68611E]" />
              Case Ageing Distribution Histogram
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Pendency Risk Analysis</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ebd8" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#0F172A' }} />
                <YAxis tick={{ fontSize: 11, fill: '#0F172A' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFEF7', borderColor: '#D8D2A6', borderRadius: 8, fontSize: 12 }} 
                />
                <Bar dataKey="cases" fill="#7D2932" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Overlap Resolution Pie */}
        <div className="bg-[#FFFFFF] border border-[#D8D2A6] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#0B2545] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0B2545]" />
              Overlap Triage & Coordination Status
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Total Flagged: {stats.overlap_metrics.total_flagged}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overlapData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} (${(((percent || 0) * 100)).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {overlapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFEF7', borderColor: '#D8D2A6', borderRadius: 8, fontSize: 12 }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Informational GovTech Card */}
        <div className="bg-[#FEFCDF] border-2 border-[#D8D2A6] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#7D2932] font-black text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              Statutory Defensibility Summary
            </div>
            <h4 className="text-sm font-bold text-[#0B2545] mb-1">
              Zero Destructive Auto-Merges Across Bureaus
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              In accordance with AICTE administrative guidelines, cases originating in separate cells (Regulation Bureau, PGRC, Approval Bureau) remain sovereign legal records. CORD coordinates intelligence via Co-Docket™ Review Packs without consolidating or erasing individual ticket lifecycles.
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-lg border border-[#D8D2A6] text-[11px] text-[#68611E] font-semibold flex items-center justify-between">
            <span>Primary Anchor Protocol: Verified AICTE PID</span>
            <span>Jaro-Winkler + TF-IDF Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
