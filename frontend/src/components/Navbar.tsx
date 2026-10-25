import React from 'react';
import { ShieldCheck, UserCheck, Activity, Award } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="w-full bg-[#FFFFFF] border-b-2 border-[#7D2932] shadow-sm sticky top-0 z-50">
      {/* Top micro-bar */}
      <div className="bg-[#0B2545] text-white text-[11px] px-6 py-1 flex justify-between items-center tracking-wide font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-[#FEF3C7]">
            <Award className="w-3.5 h-3.5 text-[#FEF3C7]" />
            GOVERNMENT OF INDIA · MINISTRY OF EDUCATION
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200">All India Council for Technical Education (AICTE)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CORD GovTech Secure Node Active
          </span>
          <span className="text-slate-400">|</span>
          <span>SIH 2026 · Problem Statement 26264</span>
        </div>
      </div>

      {/* Main Navbar: APP LOGO (left) - NAME (center) - AICTE LOGO (right) */}
      <div className="w-full px-8 py-4 flex items-center justify-between gap-6">

        {/* Left: CORD Tech Logo Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-14 h-11 rounded-lg bg-gradient-to-br from-[#0B2545] via-[#163a69] to-[#7D2932] flex items-center justify-center shadow-md border border-[#D8D2A6] overflow-hidden">
            <span className="text-white font-extrabold text-lg tracking-tight whitespace-nowrap">
              C<span className="text-[#38bdf8]">O</span>RD
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-[#FEF3C7] text-[#68611E] border border-[#D8D2A6] uppercase tracking-wider">
                GovTech Suite
              </span>
              <span className="text-[11px] font-semibold text-[#7D2932] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Defensible Co-Docket™
              </span>
            </div>
            <p className="text-xs text-[#0F172A] font-semibold tracking-tight mt-0.5">
              Cross-Bureau Redressal Architecture
            </p>
          </div>
        </div>

        {/* Center: CORD Title */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-xl md:text-2xl font-black text-[#7D2932] tracking-tight leading-none mb-1">
            CORD: Cross-Bureau Overlap & Redressal Dashboard
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#0B2545] italic">
            Integrated AICTE Multi-Bureau Grievance Monitoring & Coordination
          </p>
        </div>

        {/* Right: AICTE Emblem + Officer Profile Pill */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#0F172A]">
              <UserCheck className="w-3.5 h-3.5 text-[#7D2932]" />
              <span>Officer: R. Sharma</span>
            </div>
            <p className="text-[11px] font-medium text-[#68611E]">
              Regulation Bureau (HQ-Delhi)
            </p>
          </div>

          <div className="bg-[#FEFCDF] border-2 border-[#D8D2A6] rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#7D2932] text-[#FEFCDF] font-black text-[9px] flex items-center justify-center shrink-0 overflow-hidden">
              AICTE
            </div>
            <div className="text-[10px] leading-tight text-left">
              <span className="font-bold text-[#7D2932] block">AICTE HQ</span>
              <span className="text-[#0B2545] font-semibold">Council Node</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
