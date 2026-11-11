import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FranchiseTerritory, 
  Hospital, 
  NurseProfile, 
  OpSlot, 
  RevenueSplitConfig 
} from '../types';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { 
  Building2, 
  MapPin, 
  Users, 
  TrendingUp, 
  Landmark, 
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  Scale,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FranchisePortalProps {
  franchise: FranchiseTerritory;
  hospitals: Hospital[];
  nurses: NurseProfile[];
  slots: OpSlot[];
  splitConfig: RevenueSplitConfig;
  isMobile?: boolean;
  activeTab?: 'territory' | 'hospitals' | 'nurses' | 'profile';
  onTabChange?: (tab: 'territory' | 'hospitals' | 'nurses' | 'profile') => void;
  onReconcileCash: (amount: number) => Promise<any>;
  onLogout?: () => void;
}

export const FranchisePortal: React.FC<FranchisePortalProps> = ({
  franchise,
  hospitals,
  nurses,
  slots,
  splitConfig,
  isMobile = false,
  activeTab = 'territory',
  onTabChange,
  onReconcileCash,
  onLogout
}) => {
  const [reconcileInput, setReconcileInput] = useState<string>('500');
  const [reconciling, setReconciling] = useState(false);

  const districtHospitals = hospitals.filter(h => h.districtId.includes('coimbatore'));
  const districtNurses = nurses.filter(n => n.districtId.includes('coimbatore'));
  const bookedSlots = slots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED');
  const totalDistrictFranchiseCut = bookedSlots.length * splitConfig.franchiseShare;

  const handleDepositCash = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(reconcileInput);
    if (!amt || amt <= 0) return;
    setReconciling(true);
    try {
      await onReconcileCash(amt);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });
      alert(`Bank deposit of ₹${amt} verified and reconciled!`);
    } catch (err: any) {
      alert(err.message || 'Failed to reconcile cash');
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 sm:pb-16">
      
      {/* Top Territory Greeting */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {franchise.agencyName[0] || 'F'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">{franchise.agencyName}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap shrink-0">
                District Partner
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              Territory: {franchise.districtName} • Admin: {franchise.assignedAdminName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Monthly Cut</span>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">
              <RollingCounter value={totalDistrictFranchiseCut} prefix="₹" height={16} />
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TERRITORY (Overview & Cash Reconciliation)              */}
      {/* ============================================================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'territory' && (
          <motion.div
            key="territory"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* ROI Target Meter - Luxury Redesigned Benchmark */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
            {/* Header: Title + Tucked Live Status Pill */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-900 tracking-tight leading-none">
                    District ROI Benchmark
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Monthly Target Realization</span>
                </div>
              </div>

              {/* Tucked Pill with Pulse */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800 tabular-nums whitespace-nowrap shrink-0 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>99% Achieved</span>
              </div>
            </div>

            {/* Financial Metrics Strip */}
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Earned This Month</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-slate-950 tabular-nums tracking-tight">₹1,48,500</span>
                  <span className="text-[11px] text-slate-400 font-medium">/ ₹1,50,000</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Target Band</span>
                <span className="text-xs font-semibold text-slate-700 tabular-nums block">₹1.0L – ₹2.0L / mo</span>
              </div>
            </div>

            {/* Apple/Stripe-tier Smooth Dual-Tone Gradient Progress Bar */}
            <div className="space-y-1.5 pt-0.5">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50 p-[1.5px]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.35)]" 
                  style={{ width: '99%' }} 
                />
              </div>

              {/* Progress Scale Sub-Labels */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium tabular-nums px-0.5">
                <span>₹0</span>
                <span className="text-emerald-700 font-semibold">₹1,48,500 (99%)</span>
                <span>₹2,00,000 Cap</span>
              </div>
            </div>
          </div>

          {/* Cash Reconciliation */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
              <Landmark className="w-4 h-4 text-slate-700" />
              <h3 className="font-semibold text-xs text-slate-900">Ground Cash Collection Reconciliation</h3>
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 rounded-xl border border-slate-200/60 p-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Counter</span>
                <span className="font-semibold text-slate-900 text-xs tabular-nums flex items-center justify-center">
                  <RollingCounter value={franchise.cashCollectedToday} prefix="₹" height={16} />
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Deposited</span>
                <span className="font-semibold text-emerald-700 text-xs tabular-nums flex items-center justify-center">
                  <RollingCounter value={franchise.cashDepositedToday} prefix="₹" height={16} />
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Pending</span>
                <span className="font-semibold text-amber-700 text-xs tabular-nums flex items-center justify-center">
                  <RollingCounter value={franchise.pendingReconciliation} prefix="₹" height={16} />
                </span>
              </div>
            </div>

            <form onSubmit={handleDepositCash} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deposit Amount (₹)</label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={reconcileInput}
                  onChange={(e) => setReconcileInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold tabular-nums text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={reconciling}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? 'animate-spin' : ''}`} />
                <span>{reconciling ? 'Reconciling...' : 'Confirm Bank Deposit'}</span>
              </button>
            </form>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HOSPITALS (Center Network in District)                  */}
      {/* ============================================================== */}
      {activeTab === 'hospitals' && (
        <motion.div
          key="hospitals"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Hospital Centers ({districtHospitals.length})
              </h3>
              <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{franchise.districtName || 'Coimbatore District'}</span>
            </div>

            <div className="space-y-2">
              {districtHospitals.map(h => (
                <div key={h.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 text-xs truncate">{h.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{h.address}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap shrink-0">
                    Active OPD
                  </span>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: NURSES (Ground Referral Force)                          */}
      {/* ============================================================== */}
      {activeTab === 'nurses' && (
        <motion.div
          key="nurses"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Community Health Nurses ({districtNurses.length})
              </h3>
              <span className="text-[11px] text-slate-400">Ground Force</span>
            </div>

            <div className="space-y-2">
              {districtNurses.map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{n.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                        {n.referralCode}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{n.districtName}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-semibold text-slate-900 tabular-nums">{n.totalReferrals} pts</span>
                    <span className="text-[10px] text-emerald-700 block font-medium">₹{n.totalEarnings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PROFILE & SETTINGS                                     */}
      {/* ============================================================== */}
      {activeTab === 'profile' && (
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200/90 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {franchise.agencyName[0] || 'F'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-slate-900 tracking-tight truncate">{franchise.agencyName}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold whitespace-nowrap shrink-0">
                      Exclusive District Franchise
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                    District: {franchise.districtName} • Admin: {franchise.assignedAdminName}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] text-slate-400 block">Monthly Revenue</span>
                <span className="text-lg font-bold text-slate-950 tabular-nums">
                  <RollingCounter value={franchise.monthlyRevenue} prefix="₹" height={22} />
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                <span className="text-[11px] text-emerald-700 font-medium block">Total Franchise Cut</span>
                <span className="text-lg font-bold text-emerald-800 tabular-nums">
                  <RollingCounter value={totalDistrictFranchiseCut} prefix="₹" height={22} />
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Legal & Franchise Compliance */}
          <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200/90 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
                    District Franchise Agreement & Legal Compliance
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Health Facility Registry (HFR) & GST Tax Compliance
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9.5px] font-bold whitespace-nowrap shrink-0">
                ABDM CERTIFIED
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">GSTIN Tax Registration</span>
                  <span className="text-emerald-700 font-bold text-[11px]">33AABCB1234F1Z8</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tax invoice splits generated in compliance with Central & State GST rules.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Exclusive District Agreement</span>
                  <span className="text-blue-700 font-bold text-[11px]">ACTIVE (FY 2026-27)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Territory rights secured under Master Franchise Deed #BC-TN-CBE-04.
                </p>
              </div>
            </div>
          </div>

          {/* Explicit Sign Out Button */}
          {onLogout && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out of Franchise Account</span>
              </button>
            </div>
          )}

        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
};

export default FranchisePortal;
