import React from 'react';
import { Search, Filter, RefreshCw, X, FileSpreadsheet, Building, AlertTriangle, FileText, BarChart3, Database } from 'lucide-react';

interface FeatureBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBureau: string;
  onBureauChange: (b: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  activeTab: 'institutions' | 'overlaps' | 'codockets' | 'analytics' | 'register';
  onSelectTab: (tab: 'institutions' | 'overlaps' | 'codockets' | 'analytics' | 'register') => void;
  onResetFilters: () => void;
  onScanOverlaps: () => void;
  scanning: boolean;
}

export const FeatureBar: React.FC<FeatureBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedBureau,
  onBureauChange,
  selectedStatus,
  onStatusChange,
  activeTab,
  onSelectTab,
  onResetFilters,
  onScanOverlaps,
  scanning
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-3">
      {/* Container matching ROW 2 FEATURE BAR in wireframe */}
      <div className="bg-[#FFFFFF] border border-[#D8D2A6] rounded-xl p-3 shadow-sm flex flex-col gap-3">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#FEFCDF] pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => onSelectTab('institutions')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'institutions'
                  ? 'bg-[#7D2932] text-white shadow-sm'
                  : 'bg-[#FEFCDF] text-[#0F172A] hover:bg-[#efe9be] border border-[#D8D2A6]'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Institution Explorer</span>
            </button>

            <button
              onClick={() => onSelectTab('overlaps')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overlaps'
                  ? 'bg-[#7D2932] text-white shadow-sm'
                  : 'bg-[#FEFCDF] text-[#0F172A] hover:bg-[#efe9be] border border-[#D8D2A6]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Explainable Overlaps</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#F3E5E4] text-[#7D2932] rounded text-[10px] font-black">
                TF-IDF
              </span>
            </button>

            <button
              onClick={() => onSelectTab('codockets')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'codockets'
                  ? 'bg-[#7D2932] text-white shadow-sm'
                  : 'bg-[#FEFCDF] text-[#0F172A] hover:bg-[#efe9be] border border-[#D8D2A6]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Co-Docket™ Dossiers</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#FEF3C7] text-[#68611E] rounded text-[10px] font-black">
                PDF
              </span>
            </button>

            <button
              onClick={() => onSelectTab('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#7D2932] text-white shadow-sm'
                  : 'bg-[#FEFCDF] text-[#0F172A] hover:bg-[#efe9be] border border-[#D8D2A6]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard Analytics</span>
            </button>

            <button
              onClick={() => onSelectTab('register')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#7D2932] text-white shadow-sm'
                  : 'bg-[#FEFCDF] text-[#0F172A] hover:bg-[#efe9be] border border-[#D8D2A6]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Full Case Register</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onScanOverlaps}
              disabled={scanning}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] text-[#68611E] border border-[#D8D2A6] hover:bg-[#fdeea8] transition cursor-pointer disabled:opacity-50"
              title="Run Deterministic PID + TF-IDF Overlap Engine"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Analyzing NLP...' : 'Run Engine Scan'}</span>
            </button>

            <a
              href="/api/reports/cases.csv"
              download
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#0B2545] text-white hover:bg-[#163a69] transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Search & Filter Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Box (6 cols) */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by AICTE PID (e.g. DEMO-PID-104, 1-8921443) or College Name..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#FFFEF7] border border-[#D8D2A6] text-xs font-medium text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7D2932] focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bureau Filter (3 cols) */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedBureau}
                onChange={(e) => onBureauChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FFFEF7] border border-[#D8D2A6] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#7D2932] cursor-pointer"
              >
                <option value="All">All Bureaus / Cells</option>
                <option value="Regulation Bureau">Regulation Bureau (RB)</option>
                <option value="PGRC">Public Grievance Redressal (PGRC)</option>
                <option value="Approval Bureau">Approval Bureau (AB)</option>
                <option value="Regional Office">Regional Office (RO)</option>
              </select>
            </div>
          </div>

          {/* Status Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FFFEF7] border border-[#D8D2A6] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#7D2932] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Under Process">Under Process</option>
              <option value="Under Show-Cause">Under Show-Cause</option>
              <option value="Inquiry Pending">Inquiry Pending</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

          {/* Clear Button (1 col) */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={onResetFilters}
              title="Reset All Filters"
              className="w-full py-2 px-2 rounded-lg bg-[#FEFCDF] text-[#68611E] border border-[#D8D2A6] hover:bg-[#f6f0c6] text-xs font-bold flex items-center justify-center transition cursor-pointer"
            >
              Reset
            </button>
          </div>

        </div>

        {/* Active Filter summary pill */}
        {(searchQuery || selectedBureau !== 'All' || selectedStatus !== 'All') && (
          <div className="flex items-center gap-2 text-[11px] text-[#68611E] font-medium bg-[#FEFCDF] px-3 py-1 rounded border border-[#D8D2A6]">
            <Filter className="w-3 h-3 text-[#7D2932]" />
            <span>Active Filters:</span>
            {searchQuery && <span className="bg-white px-2 py-0.5 rounded border border-[#D8D2A6]">Search: "{searchQuery}"</span>}
            {selectedBureau !== 'All' && <span className="bg-white px-2 py-0.5 rounded border border-[#D8D2A6]">Bureau: {selectedBureau}</span>}
            {selectedStatus !== 'All' && <span className="bg-white px-2 py-0.5 rounded border border-[#D8D2A6]">Status: {selectedStatus}</span>}
          </div>
        )}

      </div>
    </div>
  );
};
