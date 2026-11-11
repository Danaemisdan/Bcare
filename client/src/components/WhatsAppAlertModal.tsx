import React from 'react';
import { MessageCircle, CheckCheck, X, FileText, ArrowRight } from 'lucide-react';
import { PhoneModalPortal } from './PhoneModalPortal';

export interface WhatsAppNotification {
  id: string;
  to: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK';
  actionUrl?: string;
}

interface WhatsAppAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: WhatsAppNotification[];
  onTriggerDownloadRx?: (rxId: string) => void;
}

export const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onTriggerDownloadRx
}) => {
  if (!isOpen) return null;

  return (
    <PhoneModalPortal>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-150 pointer-events-auto" onClick={onClose}>
        <div className="bg-white rounded-3xl max-w-md w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[85%] animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs text-zinc-900 tracking-tight">B care WhatsApp Gateway</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-zinc-500">
                Automated Outbound Patient Notifications
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfcfc]">
          <div className="text-center my-1">
            <span className="inline-block max-w-full truncate px-2.5 py-0.5 bg-zinc-100 rounded-full text-[10px] font-medium text-zinc-500 border border-zinc-200/60 uppercase tracking-wider whitespace-nowrap">
              End-to-End Encrypted SMS / WhatsApp Dispatch
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-xs">
              <p>No outbound alerts recorded.</p>
              <p className="text-[10px] text-zinc-400 mt-1">Book an OP token to test instant automated SMS/WhatsApp alerts.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl p-3.5 shadow-subtle border border-zinc-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                  <span className="font-bold text-[11px] text-zinc-900 tracking-tight flex items-center gap-1.5">
                    {n.type === 'PRESCRIPTION_READY' && <FileText className="w-3.5 h-3.5 text-zinc-600" />}
                    {n.title}
                  </span>
                  <span className="text-[10px] tabular-nums text-zinc-400">{n.timestamp}</span>
                </div>

                <p className="text-zinc-600 whitespace-pre-line leading-relaxed text-[11px]">
                  {n.message}
                </p>

                {n.type === 'PRESCRIPTION_READY' && onTriggerDownloadRx && (
                  <button
                    onClick={() => onTriggerDownloadRx('rx-2026-001')}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Official Rx PDF</span>
                  </button>
                )}

                <div className="flex items-center justify-end gap-1 text-[10px] tabular-nums text-zinc-400 pt-1">
                  <span>Delivered to {n.to}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center text-[10px] text-zinc-400">
          Integrated with Twilio & Meta Cloud WhatsApp Gateway
        </div>

      </div>
    </div>
    </PhoneModalPortal>
  );
};
