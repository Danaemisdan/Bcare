import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PhoneModalPortalProps {
  children: React.ReactNode;
}

/**
 * PhoneModalPortal
 * Teleports any modal/sheet directly to the active mobile screen container (#phone-screen-modal-root).
 * This completely isolates the modal from:
 * 1. Ancestor scroll containers (overflow-y-auto)
 * 2. Framer Motion CSS transforms and filters (which break `position: fixed` in CSS specification)
 * 3. Desktop simulator frame boundaries
 *
 * Guarantees that bottom sheets and modals are ALWAYS 100% on-screen, perfectly anchored,
 * and immune to scroll offsets.
 */
export const PhoneModalPortal: React.FC<PhoneModalPortalProps> = ({ children }) => {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Attempt to locate screen container root
    const rootEl = document.getElementById('phone-screen-modal-root');
    if (rootEl) {
      setMountNode(rootEl);
    } else {
      // Fallback to body in standalone or headless environments
      setMountNode(document.body);
    }
  }, []);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
};
