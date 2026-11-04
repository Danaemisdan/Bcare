import React, { useState } from 'react';
import { UserRole, User as UserType } from '../types';
import { BCareLogo } from './BCareLogo';
import { 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Building2, 
  Smartphone, 
  Monitor, 
  MessageCircle,
  ChevronDown,
  Check,
  HeartHandshake,
  LogIn,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  deviceView: 'iphone' | 'android';
  onDeviceViewChange: (view: 'iphone' | 'android') => void;
  onOpenWhatsAppLog: () => void;
  unreadWhatsAppCount: number;
  currentUser?: UserType | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  deviceView,
  onDeviceViewChange,
  onOpenWhatsAppLog,
  unreadWhatsAppCount,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const rolesConfig: { role: UserRole; label: string; icon: any; userTag: string }[] = [
    {
      role: 'PATIENT',
      label: 'Patient Portal',
      icon: User,
      userTag: 'Ramesh Kumar (Patient)'
    },
    {
      role: 'DOCTOR',
      label: 'Doctor Workstation',
      icon: Stethoscope,
      userTag: 'Dr. Ananya Sharma (Cardiologist)'
    },
    {
      role: 'NURSE',
      label: 'Community Nurse',
      icon: HeartHandshake,
      userTag: 'Sister Priya Nair (Code: NURSE-PRIYA-782)'
    },
    {
      role: 'FRANCHISE_ADMIN',
      label: 'District Franchise',
      icon: Building2,
      userTag: 'Vikas Patel (Coimbatore South)'
    },
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin HQ',
      icon: ShieldCheck,
      userTag: 'HQ Governance & Splits'
    }
  ];

  const currentRoleObj = rolesConfig.find(r => r.role === currentRole)!;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          
          {/* Brand Logo (Upgraded Bespoke B care Logo) */}
          <div className="hover:opacity-90 transition-opacity">
            <BCareLogo size={36} variant="full" showGlow={true} />
          </div>

          {/* Segmented Device View Picker (Mobile Only: iPhone vs Android) */}
          <div className="hidden md:flex items-center gap-1">
            <div className="flex items-center bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/70 text-xs font-medium">
              <button
                onClick={() => onDeviceViewChange('iphone')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  deviceView === 'iphone' 
                    ? 'bg-white text-emerald-800 shadow-sm font-semibold' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>iPhone</span>
              </button>
              <button
                onClick={() => onDeviceViewChange('android')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  deviceView === 'android' 
                    ? 'bg-white text-emerald-800 shadow-sm font-semibold' 
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                <span>Android</span>
              </button>
            </div>
          </div>

          {/* Right Action: WhatsApp Feed & Minimalist Role Pill */}
          <div className="flex items-center gap-2">
            
            {/* WhatsApp notification pill button */}
            <button
              onClick={onOpenWhatsAppLog}
              className="relative p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/80 transition-colors"
              title="Simulated WhatsApp Gateway"
            >
              <MessageCircle className="w-4 h-4 text-zinc-700" />
              {unreadWhatsAppCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white tabular-nums text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                  {unreadWhatsAppCount}
                </span>
              )}
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50/80 transition-all shadow-xs text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-zinc-900">{currentRoleObj.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Minimal Dropdown Menu */}
              {roleMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRoleMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-zinc-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 border-b border-zinc-100 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Switch Active Portal
                    </div>

                    <div className="py-1 space-y-0.5">
                      {rolesConfig.map(r => {
                        const Icon = r.icon;
                        const isSelected = r.role === currentRole;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              onRoleChange(r.role);
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                              isSelected 
                                ? 'bg-zinc-100 text-zinc-950 font-semibold' 
                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <div className="truncate">
                                <p className="truncate">{r.label}</p>
                                <p className="text-[10px] text-zinc-400 font-normal truncate">{r.userTag}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Auth & Account Options */}
                    <div className="pt-1 mt-1 border-t border-zinc-100 space-y-0.5">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          if (onOpenAuth) onOpenAuth();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors font-medium"
                      >
                        <LogIn className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Sign In / Switch Account</span>
                      </button>

                      {currentUser && onLogout && (
                        <button
                          onClick={() => {
                            setRoleMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Sign In button if not logged in */}
            {!currentUser && onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* User Avatar Chip if logged in */}
            {currentUser && (
              <div 
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200/70 cursor-pointer text-xs transition-colors"
                title={`${currentUser.name} (${currentUser.role}) • Click to switch`}
              >
                <div className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-semibold text-zinc-900 max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
