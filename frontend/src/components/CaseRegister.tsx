import React, { useState } from 'react';
import { Database, Search, Filter, Clock, User, ChevronRight } from 'lucide-react';
import { CaseItem, Institution } from '../types';

interface CaseRegisterProps {
  cases: CaseItem[];
  institutions: Institution[];
  onSelectInstitution: (institutionId: number) => void;
}

export const CaseRegister: React.FC<CaseRegisterProps> = ({
  cases,
  institutions,
  onSelectInstitution
}) => {
  const [bureauFilter, setBureauFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Map institution id to name
  const instMap = new Map<number, Institution>();
  institutions.forEach(i => instMap.set(i.id, i));

  const filteredCases = cases.filter(c => {
    if (bureauFilter !== 'All' && !c.bureau_code.toLowerCase().includes(bureauFilter.toLowerCase())) return false;
    if (statusFilter !== 'All' && !c.status.toLowerCase().includes(statusFilter.toLowerCase())) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const inst = instMap.get(c.institution_id);
      const instName = inst?.name.toLowerCase() || '';
      const pid = inst?.aicte_pid?.toLowerCase() || '';
      return (
        c.synthetic_case_id.toLowerCase().includes(s) ||
        c.subject.toLowerCase().includes(s) ||
        c.category.toLowerCase().includes(s) ||
        instName.includes(s) ||
        pid.includes(s)
      );
    }
    return true;
  });

  return (
    <div className="bg-[#FFFFFF] border border-[#D8D2A6] rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FEFCDF] pb-4">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#0B2545] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7D2932]" />
            Official AICTE Central Case Register
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Showing {filteredCases.length} of {cases.length} Multi-Bureau Records
          </p>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search register..."
            className="text-xs px-3 py-1.5 rounded-lg border border-[#D8D2A6] bg-[#FFFEF7] focus:outline-none focus:ring-1 focus:ring-[#7D2932]"
          />
          <select
            value={bureauFilter}
            onChange={(e) => setBureauFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#D8D2A6] bg-[#FFFEF7]"
          >
            <option value="All">All Bureaus</option>
            <option value="Regulation">Regulation Bureau</option>
            <option value="PGRC">PGRC</option>
            <option value="Approval">Approval Bureau</option>
            <option value="Regional">Regional Office</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#D8D2A6] bg-[#FFFEF7]"
          >
            <option value="All">All Statuses</option>
            <option value="Under Process">Under Process</option>
            <option value="Under Show-Cause">Under Show-Cause</option>
            <option value="Inquiry Pending">Inquiry Pending</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FEFCDF] border-b border-[#D8D2A6] text-[#68611E] font-extrabold uppercase tracking-wider">
              <th className="py-2.5 px-3">Case ID</th>
              <th className="py-2.5 px-3">Institution & AICTE PID</th>
              <th className="py-2.5 px-3">Bureau Cell</th>
              <th className="py-2.5 px-3">Subject Matter</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Age</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCases.map((c) => {
              const inst = instMap.get(c.institution_id);
              const isShowCause = c.status.toLowerCase().includes('show-cause');
              const isDisposed = c.status.toLowerCase().includes('disposed');

              return (
                <tr key={c.id} className="hover:bg-[#FFFEF7] transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0B2545]">
                    {c.synthetic_case_id}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#0F172A] block">{inst?.name || 'Unknown'}</span>
                    <span className="text-[10px] font-mono text-[#68611E]">
                      {inst?.aicte_pid ? `PID: ${inst.aicte_pid}` : '⚠ Missing PID'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                    {c.bureau_code}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs">
                    <span className="font-semibold text-[#0F172A] line-clamp-1">{c.subject}</span>
                    <span className="text-[10px] text-slate-500 block">{c.category}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isShowCause
                        ? 'bg-[#F3E5E4] text-[#7D2932] border border-[#e2b8ba]'
                        : isDisposed
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-[#FEF3C7] text-[#68611E] border border-[#D8D2A6]'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-medium">
                    {c.days_open}d
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectInstitution(c.institution_id)}
                      className="text-[11px] font-bold text-[#7D2932] hover:underline cursor-pointer"
                    >
                      View College →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
