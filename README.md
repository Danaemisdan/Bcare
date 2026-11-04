# B care — Decentralized Digital Healthcare Platform

> Cross-platform healthcare ecosystem for **Web**, **iPhone (iOS)**, and **Android** from a single unified codebase. Streamlines Outpatient (OP) consultations, manages appointments, facilitates remote teleconsultations with AI diagnostics, branded PDF prescriptions, and decentralizes local management via a district-level franchise model.

---

## 📱 Cross-Platform Architecture (iOS • Android • Web)

Built using **React + TypeScript + Tailwind CSS** wrapped with **Capacitor**:
- **Web App**: Accessible on any desktop, tablet, and mobile browser (`npm run dev`).
- **iPhone (iOS)**: Native Xcode project inside `client/ios/App/`. Built & deployed to App Store via Capacitor (`npm run cap:open:ios`).
- **Android**: Native Android Studio project inside `client/android/`. Built & deployed to Google Play Store (`npm run cap:open:android`).
- **Interactive Device Simulator**: Toggle between **Responsive Web**, **iPhone 15 Frame**, and **Android Frame** directly inside the web interface.

---

## 🏛️ The 5 User Roles & Account Portals

| Portal | Key Features & Flows |
| :--- | :--- |
| **👤 Patient Portal** | • **Quick Onboarding**: Name, Phone, Email, DOB.<br>• **Progressive Profiling**: Non-blocking completion bar (60% red tag) with 1-click medical history updater to 100%.<br>• **OP Token Booking**: Hospital & specialty discovery with real-time token queues.<br>• **Teleconsultation Desk**: WebRTC video stream + symptoms/photo upload for visible wounds.<br>• **Prescription Archive**: 1-click branded PDF prescription download.<br>• **Community Board**: Condition-specific discussion forum (Cardiology, Diabetes, Pediatrics). |
| **🩺 Doctor Portal** | • **OP Consultation Queue**: Real-time waiting token queue with 1-click "Call Next Patient" advancement.<br>• **AI-Assisted Diagnostics Engine**: Analyzes patient age, sex, vitals, and symptoms to suggest 4–5 differential diagnoses with ICD-10 codes and triage levels.<br>• **Digital Prescription Builder**: Rapid medicine form (1-0-1 dosage, timing, duration, instructions), digital signing, and immediate PDF dispatch.<br>• **Consultation Revenue Tracker**: Tracks daily earnings per OPD patient. |
| **👩‍⚕️ Nurse Portal** | • **Unique Referral Code**: Dedicated code (`NURSE-PRIYA-782`) with 1-click copy & share.<br>• **Referral Commissions**: Automatically earns ₹15 commission per referred OP booking.<br>• **Bulk Slot Reservation Engine**: Pre-reserves a batch of tokens (e.g. slots 11–15) by paying advance fees, and assigns them on the spot to offline/walk-in patients.<br>• **Earnings Wallet**: Live commission ledger and payout log. |
| **🏢 District Franchise Portal** | • **Geo-Fenced Dashboard**: Territory restricted to assigned district (e.g. Coimbatore South & Rural).<br>• **Ground Cash Reconciliation**: Logs cash collected at rural clinic counters vs verified bank deposits.<br>• **Monthly ROI Target Meter**: Live tracking towards the ₹1,00,000 – ₹2,00,000 monthly district earnings target.<br>• **Nurse & Hospital Network**: Oversees district healthcare providers. |
| **👑 Super Admin Portal** | • **Dynamic Revenue Split Engine**: Interactive sliders/inputs to set and adjust Doctor Fee, Nurse Referral, Franchise Share, Platform Cut, and GST dynamically across all zones.<br>• **Global Financial Ledger**: Complete audited financial transparency per consultation token.<br>• **Hospital & Franchise Governance**: Dynamic onboarding and territorial licensing controls. |

---

## 💰 Dynamic Revenue Split Model

Based on a baseline **₹100 OP consultation fee**:

$$\text{Total Fee (₹100)} = \text{Doctor (₹50)} + \text{Nurse Referral (₹15)} + \text{Franchise Share (₹10)} + \text{Platform Gross (₹20)} + \text{GST (₹5)}$$

*Note: All parameters can be adjusted dynamically in real time from the Super Admin portal!*

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Install Dependencies
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Run Full-Stack Development Server
Runs both backend REST API (`http://localhost:5001`) and frontend client (`http://localhost:3000`) simultaneously:
```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 📲 Building for iPhone & Android

### Syncing Web Build into Native Apps
Whenever you build the client:
```bash
npm run build
npm run cap:sync
```

### Opening in Xcode (iOS / iPhone)
```bash
npm run cap:open:ios
```
*Requires macOS with Xcode installed.*

### Opening in Android Studio (Android)
```bash
npm run cap:open:android
```
*Requires Android Studio installed with Java 17+.*

---

## 🔒 Automated WhatsApp API Alerts Simulation
The platform includes an interactive WhatsApp notification drawer that simulates real-time outbound alerts sent to patients:
- Instant OP token reservation confirmations with hospital directions.
- Encrypted teleconsultation room join links.
- Tamper-evident branded PDF digital prescription download alerts.
