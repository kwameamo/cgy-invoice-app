import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, Download, FileText, LogOut, Edit2, X,
  CheckCircle, AlertCircle, Info, Search, Eye, Copy,
  Briefcase, Scissors, BarChart3, ChevronDown, ChevronUp,
  Shield, Clock, DollarSign, User, Building, Calendar,
  Printer, RefreshCw, Send, Check
} from "lucide-react";
import logoUrl from "./assets/cgy_logo_new.png";

/* ─────────────────────────────────────────────
   DESIGN SYSTEM — CGY Brand
   Black / Red (#CC2222) / Gold (#B8860B)
───────────────────────────────────────────── */
const BRAND = {
  red: "#CC2222",
  gold: "#B8860B",
  black: "#111111",
  darkGray: "#1e1e1e",
  midGray: "#555",
  lightGray: "#f4f4f4",
  white: "#ffffff",
};

/* ─────────────────────────────────────────────
   CONTRACT TEMPLATES
───────────────────────────────────────────── */
const GRAPHIC_DESIGN_SERVICES = [
  { label: "Logo Design", ghsMin: 650, ghsMax: 1800, usdMin: 60, usdMax: 165 },
  { label: "Full Brand Identity (Brand Guide + Assets)", ghsMin: 2500, ghsMax: 6000, usdMin: 200, usdMax: 650 },
  { label: "Flyer / Poster", ghsMin: 250, ghsMax: 650, usdMin: 30, usdMax: 60 },
  { label: "Social Media Content Pack (10 posts)", ghsMin: 550, ghsMax: 1200, usdMin: 50, usdMax: 110 },
  { label: "Business Card Design", ghsMin: 200, ghsMax: 400, usdMin: 20, usdMax: 40 },
  { label: "Packaging Design", ghsMin: 700, ghsMax: 2500, usdMin: 65, usdMax: 230 },
];

const MERCH_DESIGN_SERVICES = [
  { label: "Apparel Graphic / Clothing Design", ghsMin: 400, ghsMax: 900, usdMin: 40, usdMax: 80 },
  { label: "Full Clothing Line Concept (5–10 pieces)", ghsMin: 2000, ghsMax: 4500, usdMin: 200, usdMax: 450 },
  { label: "Tech Packs (Production Ready)", ghsMin: 700, ghsMax: 2000, usdMin: 65, usdMax: 200 },
  { label: "Brand Campaign Posters", ghsMin: 300, ghsMax: 750, usdMin: 30, usdMax: 80 },
];

const STATUSES = ["DRAFT", "SENT", "SIGNED", "ACTIVE", "COMPLETED", "CANCELLED"];

const STATUS_COLORS = {
  DRAFT: { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" },
  SENT: { bg: "#eff6ff", text: "#3b82f6", border: "#93c5fd" },
  SIGNED: { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
  ACTIVE: { bg: "#fefce8", text: "#ca8a04", border: "#fde047" },
  COMPLETED: { bg: "#f0fdf4", text: "#15803d", border: "#4ade80" },
  CANCELLED: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
};

const CONTRACT_TYPES = {
  graphic: { label: "Graphic Design & Branding", color: BRAND.red, services: GRAPHIC_DESIGN_SERVICES },
  merch: { label: "Clothing & Merch Design", color: BRAND.gold, services: MERCH_DESIGN_SERVICES },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const uid = () => `ctr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const pad = (n) => String(n).padStart(3, "0");

const blankContract = (counter, type = "graphic") => ({
  id: uid(),
  contractNumber: `CGY-${new Date().getFullYear()}-${pad(counter)}`,
  type,
  status: "DRAFT",
  contractDate: today(),
  startDate: today(),
  endDate: "",
  // Designer
  designerName: "Curio Graphics Yard",
  designerEmail: "curiographicsyard@gmail.com",
  designerPhone: "",
  designerAddress: "Koforidua, E7-0979-957, Ghana",
  // Client
  clientName: "",
  clientCompany: "",
  clientEmail: "",
  clientPhone: "",
  clientAddress: "",
  // Project
  projectTitle: "",
  servicesSelected: [],
  customServices: "",
  deliverables: "",
  currency: "GHS",
  agreedAmount: "",
  depositPercent: 50,
  revisionsIncluded: 2,
  revisionRate: 150,
  rushFeePercent: 20,
  // Payment
  paymentAccount: "0200044821",
  paymentInstitution: "Telecel",
  paymentBeneficiary: "David Amo",
  // IP
  licenseType: "Non-exclusive commercial",
  exclusivity: false,
  portfolioRights: true,
  sourceFilesIncluded: false,
  sourceFilesFee: "",
  // Notes
  specialRequirements: "",
  savedDate: "",
});

/* ─────────────────────────────────────────────
   PDF PRINT GENERATOR (DM Serif / DM Sans kept for generated contract)
───────────────────────────────────────────── */
const generateContractPDF = (contract, logoSrc = logoUrl) => {
  const typeInfo = CONTRACT_TYPES[contract.type];
  const accentColor = typeInfo.color;
  const depositAmt = contract.agreedAmount
    ? ((parseFloat(contract.agreedAmount) * contract.depositPercent) / 100).toFixed(2)
    : "—";
  const balanceAmt = contract.agreedAmount
    ? ((parseFloat(contract.agreedAmount) * (100 - contract.depositPercent)) / 100).toFixed(2)
    : "—";

  const selectedServiceLabels = contract.servicesSelected
    .map((s) => `<li>${s}</li>`)
    .join("");

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contract ${contract.contractNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; font-size: 11pt; color: #222; line-height: 1.65; padding: 0; }
    .page { max-width: 760px; margin: 0 auto; padding: 48px 52px; }
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 4px solid ${accentColor}; }
    .brand-logo { height: 48px; width: auto; display: block; object-fit: contain; }
    .contract-badge { text-align: right; }
    .contract-type { font-size: 11pt; font-weight: 700; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.06em; }
    .contract-num { font-size: 9pt; color: #888; margin-top: 4px; }
    .contract-date { font-size: 9pt; color: #888; }
    /* Alert banner */
    .legal-banner { background: #111; color: #fff; text-align: center; padding: 10px 16px; font-size: 9pt; letter-spacing: 0.04em; margin-bottom: 28px; border-radius: 3px; }
    /* Sections */
    h2 { font-family: 'DM Serif Display', serif; font-size: 14pt; color: ${accentColor}; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1.5px solid ${accentColor}33; }
    h3 { font-size: 10.5pt; font-weight: 700; color: #222; margin: 16px 0 6px; }
    p, li { margin-bottom: 6px; }
    ul { padding-left: 20px; margin-bottom: 8px; }
    /* Info grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; margin-bottom: 18px; }
    .info-cell { padding: 8px 12px; border-bottom: 1px solid #eee; border-right: 1px solid #eee; }
    .info-cell:nth-child(even) { border-right: none; }
    .info-cell:last-child, .info-cell:nth-last-child(2):nth-child(odd) { border-bottom: none; }
    .info-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 2px; }
    .info-val { font-size: 10pt; font-weight: 600; color: #111; }
    .full-cell { grid-column: 1 / -1; border-right: none; }
    /* Rates table */
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th { background: #111; color: #fff; padding: 8px 12px; text-align: left; font-size: 9pt; font-weight: 600; letter-spacing: 0.04em; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 10pt; }
    tr:nth-child(even) td { background: #fafafa; }
    /* Payment boxes */
    .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
    .pay-box { border: 1.5px solid ${accentColor}; border-radius: 4px; padding: 12px 14px; }
    .pay-label { font-size: 8pt; font-weight: 700; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .pay-amount { font-family: 'DM Serif Display', serif; font-size: 16pt; color: #111; }
    .pay-note { font-size: 8.5pt; color: #666; margin-top: 2px; }
    /* Kill fee table */
    .kill-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .kill-table th { background: #f5f5f5; color: #333; font-size: 9pt; }
    .kill-table td { font-size: 9.5pt; }
    /* IP badges */
    .badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 8.5pt; font-weight: 600; }
    .badge-yes { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }
    .badge-no { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
    /* Signature block */
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 20px; }
    .sig-party { }
    .sig-party-label { font-size: 9pt; font-weight: 700; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; }
    .sig-line { border-bottom: 1.5px solid #333; margin-bottom: 5px; height: 36px; }
    .sig-field-label { font-size: 8pt; color: #888; margin-bottom: 12px; }
    /* Footer */
    .footer { margin-top: 36px; padding-top: 16px; border-top: 2px solid ${accentColor}; text-align: center; font-size: 8.5pt; color: #888; }
    /* Warning box */
    .warn-box { background: #fff8f0; border: 1.5px solid ${accentColor}66; border-radius: 4px; padding: 10px 14px; margin: 12px 0; font-size: 9.5pt; color: #7c3a00; }
    @media print {
      body { padding: 0; }
      .page { padding: 36px 44px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <img src="${logoSrc}" alt="Curio Graphics Yard" class="brand-logo" />
    </div>
    <div class="contract-badge">
      <div class="contract-type">${typeInfo.label}</div>
      <div class="contract-num">Contract #${contract.contractNumber}</div>
      <div class="contract-date">Dated: ${fmtDate(contract.contractDate)}</div>
    </div>
  </div>

  <div class="legal-banner">⚖ This is a legally binding agreement. Both parties must read all terms before signing.</div>

  <!-- PARTIES -->
  <h2>1. Parties & Project Overview</h2>
  <div class="info-grid">
    <div class="info-cell"><div class="info-label">Designer / Studio</div><div class="info-val">Curio Graphics Yard (CGY)</div></div>
    <div class="info-cell"><div class="info-label">Designer Email</div><div class="info-val">${contract.designerEmail}</div></div>
    ${contract.designerPhone ? `<div class="info-cell"><div class="info-label">Designer Phone</div><div class="info-val">${contract.designerPhone}</div></div>` : ""}
    <div class="info-cell ${!contract.designerPhone ? "full-cell" : ""}"><div class="info-label">Designer Address</div><div class="info-val">${contract.designerAddress}</div></div>
    <div class="info-cell"><div class="info-label">Client Name</div><div class="info-val">${contract.clientName || "—"}</div></div>
    <div class="info-cell"><div class="info-label">Client Company / Brand</div><div class="info-val">${contract.clientCompany || "—"}</div></div>
    <div class="info-cell"><div class="info-label">Client Email</div><div class="info-val">${contract.clientEmail || "—"}</div></div>
    <div class="info-cell"><div class="info-label">Client Phone</div><div class="info-val">${contract.clientPhone || "—"}</div></div>
    ${contract.clientAddress ? `<div class="info-cell full-cell"><div class="info-label">Client Address</div><div class="info-val">${contract.clientAddress}</div></div>` : ""}
    <div class="info-cell full-cell"><div class="info-label">Project Title</div><div class="info-val">${contract.projectTitle || "—"}</div></div>
    <div class="info-cell"><div class="info-label">Start Date</div><div class="info-val">${fmtDate(contract.startDate)}</div></div>
    <div class="info-cell"><div class="info-label">Estimated End Date</div><div class="info-val">${contract.endDate ? fmtDate(contract.endDate) : "TBD"}</div></div>
  </div>

  <!-- SERVICES -->
  <h2>2. Services Selected & Agreed Rates</h2>
  ${contract.servicesSelected.length > 0 ? `
  <table>
    <thead><tr><th>Service</th><th>Rate (GHS)</th><th>Rate (USD Eq.)</th></tr></thead>
    <tbody>
      ${typeInfo.services.filter(s => contract.servicesSelected.includes(s.label)).map(s => `
      <tr><td>${s.label}</td><td>GHS ${s.ghsMin.toLocaleString()} – ${s.ghsMax.toLocaleString()}</td><td>USD ${s.usdMin} – ${s.usdMax}</td></tr>`).join("")}
    </tbody>
  </table>` : "<p>No services selected.</p>"}
  ${contract.customServices ? `<p><strong>Additional / Custom Services:</strong> ${contract.customServices}</p>` : ""}

  <div class="info-grid" style="margin-top:12px">
    <div class="info-cell"><div class="info-label">Agreed Project Rate</div><div class="info-val">${contract.currency} ${contract.agreedAmount || "—"}</div></div>
    <div class="info-cell"><div class="info-label">Currency</div><div class="info-val">${contract.currency}</div></div>
    <div class="info-cell"><div class="info-label">Deposit Percentage</div><div class="info-val">${contract.depositPercent}%</div></div>
    <div class="info-cell"><div class="info-label">Revisions Included</div><div class="info-val">${contract.revisionsIncluded} rounds</div></div>
  </div>

  <!-- SCOPE -->
  <h2>3. Scope of Work & Deliverables</h2>
  ${contract.deliverables ? `<p>${contract.deliverables.replace(/\n/g, "<br>")}</p>` : `<ul>
    <li>Deliverables as described in Section 2 services above</li>
    <li>Final files in agreed formats (PNG, JPG, SVG, PDF as applicable)</li>
    <li>Source/native files only if Section 9 indicates inclusion</li>
  </ul>`}
  <div class="warn-box">⚠ Any work not explicitly listed above is considered OUT OF SCOPE and will be quoted and billed separately via written Change Order.</div>
  ${contract.specialRequirements ? `<h3>Special Requirements</h3><p>${contract.specialRequirements}</p>` : ""}

  <!-- TIMELINE -->
  <h2>4. Project Timeline & Milestones</h2>
  <table>
    <thead><tr><th>Phase</th><th>Deliverable</th><th>Due Date</th><th>Payment Due</th></tr></thead>
    <tbody>
      <tr><td>Phase 1 — Brief & Deposit</td><td>Signed contract + deposit received</td><td>${fmtDate(contract.startDate)}</td><td>${contract.depositPercent}% — ${contract.currency} ${depositAmt}</td></tr>
      <tr><td>Phase 2 — Concepts Presented</td><td>Initial designs / drafts</td><td>TBD</td><td>—</td></tr>
      <tr><td>Phase 3 — Revisions (${contract.revisionsIncluded} rounds)</td><td>Refined designs per feedback</td><td>TBD</td><td>—</td></tr>
      <tr><td>Phase 4 — Final Approval</td><td>Client written sign-off</td><td>TBD</td><td>—</td></tr>
      <tr><td>Phase 5 — Final Delivery</td><td>All agreed final files delivered</td><td>${contract.endDate ? fmtDate(contract.endDate) : "TBD"}</td><td>${100 - contract.depositPercent}% — ${contract.currency} ${balanceAmt}</td></tr>
    </tbody>
  </table>
  <p style="font-size:9.5pt;color:#7c3a00;margin-top:8px">⏱ If the Client fails to respond within 5 business days of any submission, the timeline shifts forward accordingly. A Rush Fee of ${contract.rushFeePercent}% applies for urgent delivery after a Client-caused delay.</p>

  <!-- REVISIONS -->
  <h2>5. Revision Policy</h2>
  <table>
    <thead><tr><th>Item</th><th>Terms</th></tr></thead>
    <tbody>
      <tr><td>Included Revisions</td><td>${contract.revisionsIncluded} rounds per deliverable</td></tr>
      <tr><td>Additional Revisions</td><td>${contract.currency} ${contract.revisionRate} per additional round</td></tr>
      <tr><td>New Design Direction</td><td>Treated as a new project — re-quoted separately</td></tr>
    </tbody>
  </table>
  <p>A "revision" means minor changes to an approved concept. Scrapping the direction entirely = new project. Once a design is approved in writing, that phase is <strong>closed</strong>.</p>

  <!-- PAYMENT -->
  <h2>6. Payment Terms</h2>
  <div class="payment-grid">
    <div class="pay-box">
      <div class="pay-label">Deposit Due at Signing</div>
      <div class="pay-amount">${contract.currency} ${depositAmt}</div>
      <div class="pay-note">${contract.depositPercent}% — Work begins only after this is received</div>
    </div>
    <div class="pay-box">
      <div class="pay-label">Balance Due at Final Delivery</div>
      <div class="pay-amount">${contract.currency} ${balanceAmt}</div>
      <div class="pay-note">${100 - contract.depositPercent}% — Paid before final files are released</div>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-cell"><div class="info-label">Payment Account</div><div class="info-val">${contract.paymentAccount}</div></div>
    <div class="info-cell"><div class="info-label">Institution</div><div class="info-val">${contract.paymentInstitution}</div></div>
    <div class="info-cell full-cell"><div class="info-label">Beneficiary</div><div class="info-val">${contract.paymentBeneficiary}</div></div>
  </div>
  <h3>Kill Fee — Cancellation Schedule</h3>
  <table class="kill-table">
    <thead><tr><th>Project Completion at Cancellation</th><th>Amount Owed</th></tr></thead>
    <tbody>
      <tr><td>Before concepts delivered</td><td>Client forfeits deposit — no refund</td></tr>
      <tr><td>After concepts delivered</td><td>75% of total project rate</td></tr>
      <tr><td>Near completion (revisions done)</td><td>100% of total project rate</td></tr>
    </tbody>
  </table>
  <p>Late payments after 7 days incur a holding fee of GHS 50 / USD 5 per day. Final files are withheld until full payment is confirmed.</p>

  <!-- CLIENT RESPONSIBILITIES -->
  <h2>7. Client Responsibilities</h2>
  <ul>
    <li>Provide all required content (text, logos, brand assets, references) before work begins.</li>
    <li>Designate ONE point of contact — consolidated feedback only, no conflicting instructions.</li>
    <li>Provide written feedback within 5 business days of each submission.</li>
    <li>NOT share, post, or use any draft or work-in-progress designs publicly before final approval.</li>
    <li>Ensure all content provided to CGY is owned or properly licensed by the Client.</li>
  </ul>
  ${contract.type === "merch" ? `
  <ul>
    <li>Specify the intended print method (screen print, DTF, embroidery) upfront — this affects file preparation.</li>
    <li>Verify all design details (spelling, measurements, color codes) before written approval.</li>
    <li>NOT send CGY files to manufacturers without paying the full balance first.</li>
  </ul>` : ""}

  <!-- INTELLECTUAL PROPERTY -->
  <h2>8. Intellectual Property & Ownership</h2>
  <div class="badge-row">
    <span class="badge ${contract.portfolioRights ? "badge-yes" : "badge-no"}">${contract.portfolioRights ? "✓" : "✗"} CGY Portfolio Rights</span>
    <span class="badge ${contract.sourceFilesIncluded ? "badge-yes" : "badge-no"}">${contract.sourceFilesIncluded ? "✓" : "✗"} Source Files Included</span>
    <span class="badge ${contract.exclusivity ? "badge-yes" : "badge-no"}">${contract.exclusivity ? "✓" : "✗"} Exclusive License</span>
  </div>
  <p><strong>Ownership Before Full Payment:</strong> All designs remain CGY's exclusive intellectual property until full payment is confirmed. The Client has NO right to use, publish, or distribute any design — including drafts — until the final invoice is paid in full.</p>
  <p><strong>License Upon Full Payment:</strong> ${contract.licenseType} license is granted to the Client upon receipt of full payment, for the Client's brand/business use only.</p>
  ${!contract.sourceFilesIncluded ? `<p><strong>Source Files:</strong> Native/source files (.AI, .PSD, etc.) are NOT included in standard delivery${contract.sourceFilesFee ? `. They may be purchased separately at ${contract.currency} ${contract.sourceFilesFee}` : ""}.</p>` : ""}

  <!-- PRODUCTION DISCLAIMER (merch only) -->
  ${contract.type === "merch" ? `
  <h2>9. Production & Printing Disclaimer</h2>
  <p>CGY provides design files only. CGY is NOT responsible for:</p>
  <ul>
    <li>Print quality, color variations, or results caused by third-party printers or manufacturers.</li>
    <li>Compatibility issues if the Client changes the print method after files are delivered.</li>
    <li>Sizing, fit, or construction of physical garments.</li>
    <li>Errors on printed/produced garments from Client's failure to proofread before production.</li>
  </ul>
  <div class="warn-box">⚠ It is the Client's responsibility to verify all file specifications with their manufacturer BEFORE sending to production. CGY strongly recommends a test print or sample before full production runs.</div>` : ""}

  <!-- TERMINATION -->
  <h2>${contract.type === "merch" ? "10" : "9"}. Termination</h2>
  <ul>
    <li>Either party may terminate with written notice (WhatsApp or email).</li>
    <li>Client pays for all work completed to date, plus the applicable kill fee (Section 6).</li>
    <li>Final files are released only after all outstanding payments are received.</li>
    <li>CGY may terminate immediately if the Client is abusive, non-communicative for 14+ days, or requests illegal/unethical content.</li>
  </ul>

  <!-- WARRANTIES & LIABILITY -->
  <h2>${contract.type === "merch" ? "11" : "10"}. Warranties & Limitation of Liability</h2>
  <ul>
    <li>CGY warrants all designs will be original and not knowingly infringe third-party rights.</li>
    <li>CGY makes NO guarantee of specific business outcomes from any design.</li>
    <li>Client warrants all provided content does not infringe third-party rights — Client bears full legal responsibility for their own materials.</li>
    <li>CGY's maximum liability under this Agreement shall not exceed the total fees paid for this project.</li>
  </ul>

  <!-- DISPUTE RESOLUTION -->
  <h2>${contract.type === "merch" ? "12" : "11"}. Dispute Resolution & Governing Law</h2>
  <p>In the event of a dispute, both parties agree to attempt resolution through direct good-faith communication first. If unresolved within 14 days, the matter may be escalated to mediation. This Agreement is governed by the laws of <strong>Ghana</strong>.</p>

  <!-- GENERAL -->
  <h2>${contract.type === "merch" ? "13" : "12"}. General Provisions</h2>
  <ul>
    <li>This Agreement is the complete understanding between both parties, replacing all prior verbal or written discussions.</li>
    <li>All changes to scope, price, or timeline must be agreed in writing by both parties.</li>
    <li>CGY operates as an independent creative studio — not an employee of the Client.</li>
    <li>If any clause is found unenforceable, all other clauses remain in full effect.</li>
  </ul>

  <!-- SIGNATURES -->
  <h2>Signatures & Agreement</h2>
  <p>By signing below, both parties confirm they have fully read, understood, and agreed to all terms of this Agreement.</p>
  <div class="sig-grid">
    <div class="sig-party">
      <div class="sig-party-label">Designer — Curio Graphics Yard</div>
      <div class="sig-line"></div><div class="sig-field-label">Signature</div>
      <div class="sig-line"></div><div class="sig-field-label">Printed Name</div>
      <div class="sig-line"></div><div class="sig-field-label">Date</div>
    </div>
    <div class="sig-party">
      <div class="sig-party-label">Client</div>
      <div class="sig-line"></div><div class="sig-field-label">Signature</div>
      <div class="sig-line"></div><div class="sig-field-label">Printed Name</div>
      <div class="sig-line"></div><div class="sig-field-label">Date</div>
    </div>
  </div>

  <div class="footer">
    Curio Graphics Yard — Where Creativity Meets Professionalism.<br>
    Contract #${contract.contractNumber} • Both parties retain a signed copy for their records.
  </div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`);
  win.document.close();
};

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */
const Notif = ({ notif, onClose }) => {
  if (!notif.show) return null;
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  const icons = { success: <CheckCircle size={16} />, error: <AlertCircle size={16} />, info: <Info size={16} /> };
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
      style={{ animation: "slideDown 0.3s ease-out" }}>
      <div className={`rounded-lg shadow-lg p-4 flex items-start gap-3 border ${styles[notif.type]}`}>
        {icons[notif.type]}
        <p className="flex-1 text-sm">{notif.message}</p>
        <button onClick={onClose}><X size={16} /></button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return (
    <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
      {status}
    </span>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}{required && <span style={{ color: BRAND.red }}> *</span>}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width: "100%", border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", transition: "border-color 0.2s", background: "#fff", ...style }}
    onFocus={e => e.target.style.borderColor = BRAND.red}
    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ width: "100%", border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", resize: "vertical", transition: "border-color 0.2s", fontFamily: "inherit" }}
    onFocus={e => e.target.style.borderColor = BRAND.red}
    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
  />
);

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange}
    style={{ width: "100%", border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", background: "#fff", appearance: "none", cursor: "pointer" }}>
    {children}
  </select>
);

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function CGYContractManager({ matchInvoiceUI = false }) {
  const [view, setView] = useState("dashboard");
  const [currentView, setCurrentView] = useState("create"); // 'create' | 'stats' — when matchInvoiceUI, same as Invoice
  const [contracts, setContracts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cgy_contracts") || "[]"); } catch { return []; }
  });
  const [counter, setCounter] = useState(() => {
    try { return parseInt(localStorage.getItem("cgy_contract_counter") || "1"); } catch { return 1; }
  });
  const [editing, setEditing] = useState(null); // contract being created/edited
  const [notif, setNotif] = useState({ show: false, message: "", type: "info" });
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [previewContract, setPreviewContract] = useState(null);

  const notify = useCallback((message, type = "info") => {
    setNotif({ show: true, message, type });
    setTimeout(() => setNotif({ show: false, message: "", type: "info" }), 4000);
  }, []);

  const saveToStorage = (list, cnt) => {
    localStorage.setItem("cgy_contracts", JSON.stringify(list));
    localStorage.setItem("cgy_contract_counter", String(cnt));
  };

  const saveContract = () => {
    if (!editing.clientName.trim()) return notify("Client name is required.", "error");
    if (!editing.projectTitle.trim()) return notify("Project title is required.", "error");
    if (!editing.agreedAmount) return notify("Agreed amount is required.", "error");

    const now = new Date().toISOString();
    const updated = { ...editing, savedDate: now };

    let newList, newCounter = counter;
    const existing = contracts.find(c => c.id === updated.id);
    if (existing) {
      newList = contracts.map(c => c.id === updated.id ? updated : c);
      notify("Contract updated successfully!", "success");
    } else {
      newList = [...contracts, updated];
      newCounter = counter + 1;
      setCounter(newCounter);
      notify("Contract saved successfully!", "success");
    }
    setContracts(newList);
    saveToStorage(newList, newCounter);
    setEditing(null);
    setView("dashboard");
  };

  const deleteContract = (id) => {
    if (!window.confirm("Delete this contract? This cannot be undone.")) return;
    const newList = contracts.filter(c => c.id !== id);
    setContracts(newList);
    saveToStorage(newList, counter);
    notify("Contract deleted.", "success");
  };

  const duplicateContract = (contract) => {
    const copy = { ...contract, id: uid(), contractNumber: `CGY-${new Date().getFullYear()}-${pad(counter)}`, status: "DRAFT", savedDate: "", contractDate: today() };
    const newList = [...contracts, copy];
    const newCounter = counter + 1;
    setContracts(newList);
    setCounter(newCounter);
    saveToStorage(newList, newCounter);
    notify("Contract duplicated!", "success");
  };

  const newContract = (type) => {
    setEditing(blankContract(counter, type));
    setView("editor");
  };

  const editContract = (contract) => {
    setEditing({ ...contract });
    setView("editor");
  };

  // Derived
  const filtered = contracts.filter(c => {
    if (filterType !== "all" && c.type !== filterType) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return (c.contractNumber || "").toLowerCase().includes(q) ||
      (c.clientName || "").toLowerCase().includes(q) ||
      (c.projectTitle || "").toLowerCase().includes(q);
  }).slice().reverse();

  const stats = {
    total: contracts.length,
    graphic: contracts.filter(c => c.type === "graphic").length,
    merch: contracts.filter(c => c.type === "merch").length,
    signed: contracts.filter(c => ["SIGNED", "ACTIVE", "COMPLETED"].includes(c.status)).length,
    draft: contracts.filter(c => c.status === "DRAFT").length,
    totalValue: contracts.reduce((s, c) => s + (parseFloat(c.agreedAmount) || 0), 0),
  };

  /* ── STYLES ── */
  const cardStyle = matchInvoiceUI ? undefined : { background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };
  const cardClass = matchInvoiceUI ? "bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4" : "";
  const sectionTitleClass = matchInvoiceUI ? "text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4" : "";
  const btnRed = { background: BRAND.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "opacity 0.2s" };
  const btnGold = { ...btnRed, background: BRAND.gold };
  const btnBlack = { ...btnRed, background: "#111" };
  const btnGhost = { ...btnRed, background: "transparent", color: "#555", border: "1px solid #e5e7eb" };

  /* ── EDITOR VIEW ── */
  if (view === "editor" && editing) {
    const typeInfo = CONTRACT_TYPES[editing.type];
    const accentColor = typeInfo.color;
    const set = (key) => (e) => setEditing(prev => ({ ...prev, [key]: e.target.value }));
    const toggle = (key) => () => setEditing(prev => ({ ...prev, [key]: !prev[key] }));
    const toggleService = (label) => {
      setEditing(prev => {
        const has = prev.servicesSelected.includes(label);
        return { ...prev, servicesSelected: has ? prev.servicesSelected.filter(s => s !== label) : [...prev.servicesSelected, label] };
      });
    };

    const editorRootClass = matchInvoiceUI ? "min-h-full bg-gray-50" : "";
    const editorRootStyle = matchInvoiceUI ? {} : { minHeight: "100vh", background: "#f8f8f8", fontFamily: "'DM Sans', sans-serif" };
    const headerStyle = matchInvoiceUI
      ? { background: "#fff", color: "#111", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderBottom: "1px solid #e5e7eb" }
      : { background: "#111", color: "#fff", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" };
    const headerInnerStyle = matchInvoiceUI ? { maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 } : { maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 };
    const cancelBtnStyle = matchInvoiceUI ? { background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 } : { ...btnGhost, background: "transparent", color: "#aaa", border: "1px solid #333" };
    const previewBtnStyle = matchInvoiceUI ? { background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 } : { ...btnGhost, background: "transparent", color: "#aaa", border: "1px solid #333" };
    const saveBtnStyle = matchInvoiceUI ? { background: accentColor, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 } : { background: accentColor, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 };

    return (
      <div className={editorRootClass} style={editorRootStyle}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap'); * { box-sizing: border-box; } @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <Notif notif={notif} onClose={() => setNotif({ show: false })} />

        {/* Editor Header */}
        <div style={headerStyle}>
          <div style={headerInnerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {!matchInvoiceUI && <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: BRAND.red }}>CGY</span>}
              {!matchInvoiceUI && <div style={{ width: 1, height: 28, background: "#333" }} />}
              <span style={{ fontSize: 13, color: matchInvoiceUI ? "#374151" : "#aaa", fontWeight: matchInvoiceUI ? 600 : 400 }}>{editing.contractNumber}</span>
              <span style={{ fontSize: 11, background: accentColor + "22", color: accentColor, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{typeInfo.label}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setEditing(null); setView("dashboard"); }}
                className={matchInvoiceUI ? "flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition" : ""}
                style={matchInvoiceUI ? undefined : cancelBtnStyle}
              >
                <X size={16} /> {matchInvoiceUI ? "Back to contracts" : "Cancel"}
              </button>
              <button onClick={() => generateContractPDF(editing)} style={previewBtnStyle}>
                <Eye size={16} /> Preview PDF
              </button>
              <button onClick={saveContract} style={saveBtnStyle}>
                <Check size={16} /> Save Contract
              </button>
            </div>
          </div>
        </div>

        <div className={matchInvoiceUI ? "max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6" : ""} style={matchInvoiceUI ? undefined : { maxWidth: 900, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Section: Contract Info */}
          <div className={cardClass} style={cardStyle}>
            <h3 className={sectionTitleClass} style={!matchInvoiceUI ? { fontFamily: "'DM Serif Display'", fontSize: 18, marginBottom: 20, color: accentColor, paddingBottom: 10, borderBottom: `2px solid ${accentColor}22` } : undefined}>Contract Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label="Contract Number"><Input value={editing.contractNumber} onChange={set("contractNumber")} /></Field>
              <Field label="Contract Date"><Input type="date" value={editing.contractDate} onChange={set("contractDate")} /></Field>
              <Field label="Status">
                <Select value={editing.status} onChange={set("status")}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Project Start Date"><Input type="date" value={editing.startDate} onChange={set("startDate")} /></Field>
              <Field label="Estimated End Date"><Input type="date" value={editing.endDate} onChange={set("endDate")} /></Field>
              <Field label="Currency">
                <Select value={editing.currency} onChange={set("currency")}>
                  <option value="GHS">GHS — Ghanaian Cedis</option>
                  <option value="USD">USD — US Dollars</option>
                </Select>
              </Field>
            </div>
          </div>

          {/* Section: Client Info */}
          <div className={cardClass} style={cardStyle}>
            <h3 className={sectionTitleClass} style={!matchInvoiceUI ? { fontFamily: "'DM Serif Display'", fontSize: 18, marginBottom: 20, color: accentColor, paddingBottom: 10, borderBottom: `2px solid ${accentColor}22` } : undefined}>Client Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Client Name" required><Input value={editing.clientName} onChange={set("clientName")} placeholder="Full name of the client" /></Field>
              <Field label="Company / Brand Name"><Input value={editing.clientCompany} onChange={set("clientCompany")} placeholder="Business or brand name" /></Field>
              <Field label="Client Email"><Input type="email" value={editing.clientEmail} onChange={set("clientEmail")} placeholder="client@email.com" /></Field>
              <Field label="Client Phone"><Input value={editing.clientPhone} onChange={set("clientPhone")} placeholder="+233 ..." /></Field>
              <Field label="Client Address" ><Input value={editing.clientAddress} onChange={set("clientAddress")} placeholder="Address, City, Country" /></Field>
              <Field label="Project Title" required><Input value={editing.projectTitle} onChange={set("projectTitle")} placeholder="e.g., Logo Design for XYZ Brand" /></Field>
            </div>
          </div>

          {/* Section: Services */}
          <div className={cardClass} style={cardStyle}>
            <h3 className={sectionTitleClass} style={!matchInvoiceUI ? { fontFamily: "'DM Serif Display'", fontSize: 18, marginBottom: 16, color: accentColor, paddingBottom: 10, borderBottom: `2px solid ${accentColor}22` } : undefined}>Services & Pricing</h3>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Select all services that apply to this contract:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {typeInfo.services.map(s => {
                const selected = editing.servicesSelected.includes(s.label);
                return (
                  <div key={s.label} onClick={() => toggleService(s.label)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 8, border: `2px solid ${selected ? accentColor : "#e5e7eb"}`, background: selected ? accentColor + "0d" : "#fafafa", cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${selected ? accentColor : "#ccc"}`, background: selected ? accentColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selected && <Check size={12} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: selected ? 600 : 400, color: selected ? "#111" : "#555" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>GHS {s.ghsMin.toLocaleString()}–{s.ghsMax.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <Field label="Custom / Additional Services">
              <Textarea value={editing.customServices} onChange={set("customServices")} placeholder="Any additional services not listed above..." rows={2} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
              <Field label="Agreed Project Amount" required>
                <Input type="number" value={editing.agreedAmount} onChange={set("agreedAmount")} placeholder="0.00" />
              </Field>
              <Field label="Deposit %">
                <Input type="number" value={editing.depositPercent} onChange={set("depositPercent")} placeholder="50" />
              </Field>
              <Field label="Rush Fee %">
                <Input type="number" value={editing.rushFeePercent} onChange={set("rushFeePercent")} placeholder="20" />
              </Field>
              <Field label="Revisions Included">
                <Input type="number" value={editing.revisionsIncluded} onChange={set("revisionsIncluded")} placeholder="2" />
              </Field>
              <Field label="Additional Revision Rate">
                <Input type="number" value={editing.revisionRate} onChange={set("revisionRate")} placeholder="150" />
              </Field>
            </div>
          </div>

          {/* Section: Deliverables */}
          <div className={cardClass} style={cardStyle}>
            <h3 className={sectionTitleClass} style={!matchInvoiceUI ? { fontFamily: "'DM Serif Display'", fontSize: 18, marginBottom: 20, color: accentColor, paddingBottom: 10, borderBottom: `2px solid ${accentColor}22` } : undefined}>Deliverables & Requirements</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Specific Deliverables (one per line)">
                <Textarea value={editing.deliverables} onChange={set("deliverables")} placeholder={"e.g., 3 initial logo concepts\nFinal logo: PNG, SVG, PDF\nBrand color palette"} rows={5} />
              </Field>
              <Field label="Special Requirements">
                <Textarea value={editing.specialRequirements} onChange={set("specialRequirements")} placeholder="Print method, color specs, garment types, dimensions, etc." rows={3} />
              </Field>
            </div>
          </div>

          {/* Section: Payment */}
          <div className={cardClass} style={cardStyle}>
            <h3 className={sectionTitleClass} style={!matchInvoiceUI ? { fontFamily: "'DM Serif Display'", fontSize: 18, marginBottom: 20, color: accentColor, paddingBottom: 10, borderBottom: `2px solid ${accentColor}22` } : undefined}>Payment Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label="Account Number"><Input value={editing.paymentAccount} onChange={set("paymentAccount")} /></Field>
              <Field label="Institution"><Input value={editing.paymentInstitution} onChange={set("paymentInstitution")} /></Field>
              <Field label="Beneficiary"><Input value={editing.paymentBeneficiary} onChange={set("paymentBeneficiary")} /></Field>
            </div>
          </div>

          {/* Section: IP */}
          <div className={cardClass} style={cardStyle}>
            <h3 className={sectionTitleClass} style={!matchInvoiceUI ? { fontFamily: "'DM Serif Display'", fontSize: 18, marginBottom: 20, color: accentColor, paddingBottom: 10, borderBottom: `2px solid ${accentColor}22` } : undefined}>Intellectual Property</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="License Type">
                <Select value={editing.licenseType} onChange={set("licenseType")}>
                  <option>Non-exclusive commercial</option>
                  <option>Exclusive commercial</option>
                  <option>Full assignment of rights</option>
                  <option>Limited usage license</option>
                </Select>
              </Field>
              <Field label="Source Files Fee (if sold separately)"><Input value={editing.sourceFilesFee} onChange={set("sourceFilesFee")} placeholder="0.00" /></Field>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              {[
                ["portfolioRights", "CGY Portfolio Rights", "CGY may display this work publicly"],
                ["sourceFilesIncluded", "Source Files Included", "Native files (.AI, .PSD) are included"],
                ["exclusivity", "Exclusive License", "CGY won't use similar designs for others"],
              ].map(([key, label, desc]) => (
                <div key={key} onClick={toggle(key)}
                  style={{ flex: "1 1 200px", padding: "14px 16px", borderRadius: 8, border: `2px solid ${editing[key] ? accentColor : "#e5e7eb"}`, background: editing[key] ? accentColor + "0d" : "#fafafa", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${editing[key] ? accentColor : "#ccc"}`, background: editing[key] ? accentColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {editing[key] && <Check size={11} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: editing[key] ? "#111" : "#555" }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#888", marginLeft: 28 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Save buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingBottom: 40 }}>
            <button
              onClick={() => { setEditing(null); setView("dashboard"); }}
              className={matchInvoiceUI ? "flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition" : ""}
              style={matchInvoiceUI ? undefined : btnGhost}
            >
              <X size={16} /> {matchInvoiceUI ? "Back to contracts" : "Cancel"}
            </button>
            <button onClick={() => generateContractPDF(editing)} style={btnBlack}><Eye size={16} /> Preview PDF</button>
            <button onClick={saveContract} style={{ ...btnRed, background: accentColor, fontSize: 15, padding: "12px 28px" }}><Check size={18} /> Save Contract</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── DASHBOARD VIEW ── */
  const dashboardRootStyle = matchInvoiceUI ? { minHeight: "100%", background: "transparent" } : { minHeight: "100vh", background: "#f8f8f8", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={dashboardRootStyle} className={matchInvoiceUI ? "min-h-full" : ""}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        .contract-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important; transform: translateY(-1px); }
        .contract-card { transition: all 0.2s ease; }
        .action-btn:hover { opacity: 0.8; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .filter-row { flex-direction: column !important; }
          .contract-actions { flex-wrap: wrap !important; }
        }
      `}</style>
      <Notif notif={notif} onClose={() => setNotif({ show: false })} />

      {/* TOP NAV — same as Invoice when matchInvoiceUI: Create Contract | Statistics */}
      {matchInvoiceUI ? (
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
          <div className="no-print hidden md:flex mb-6 gap-4">
            <button
              onClick={() => setCurrentView("create")}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                currentView === "create" ? "bg-blue-500 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileText size={20} /> Create Contract
            </button>
            <button
              onClick={() => setCurrentView("stats")}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                currentView === "stats" ? "bg-blue-500 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <BarChart3 size={20} /> Statistics
            </button>
          </div>

          {/* Mobile bottom nav — same as Invoice */}
          <div className="no-print fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-40">
            <div className="flex justify-around items-center h-16">
              <button
                onClick={() => setCurrentView("create")}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition ${
                  currentView === "create" ? "text-blue-500" : "text-gray-600"
                }`}
              >
                <FileText size={22} />
                <span className="text-xs font-medium">Create</span>
              </button>
              <button
                onClick={() => setCurrentView("stats")}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition ${
                  currentView === "stats" ? "text-blue-500" : "text-gray-600"
                }`}
              >
                <BarChart3 size={22} />
                <span className="text-xs font-medium">Stats</span>
              </button>
            </div>
          </div>

          {/* Stats view — same layout as Invoice Statistics */}
          {currentView === "stats" && (
            <div className="no-print bg-white p-4 md:p-6 rounded-lg shadow-sm mb-4">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Contract Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-gray-50 p-4 md:p-6 rounded">
                  <div className="text-xs md:text-sm text-gray-600 mb-2">Total Contracts</div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-700">{stats.total}</div>
                </div>
                <div className="bg-red-50 p-4 md:p-6 rounded">
                  <div className="text-xs md:text-sm text-gray-600 mb-2">Design Contracts</div>
                  <div className="text-2xl md:text-3xl font-bold text-red-600">{stats.graphic}</div>
                </div>
                <div className="bg-amber-50 p-4 md:p-6 rounded">
                  <div className="text-xs md:text-sm text-gray-600 mb-2">Merch Contracts</div>
                  <div className="text-2xl md:text-3xl font-bold text-amber-700">{stats.merch}</div>
                </div>
                <div className="bg-green-50 p-4 md:p-6 rounded">
                  <div className="text-xs md:text-sm text-gray-600 mb-2">Signed / Active</div>
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.signed}</div>
                </div>
                <div className="bg-gray-50 p-4 md:p-6 rounded">
                  <div className="text-xs md:text-sm text-gray-600 mb-2">Drafts</div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-700">{stats.draft}</div>
                </div>
                <div className="bg-blue-50 p-4 md:p-6 rounded border border-blue-100">
                  <div className="text-xs md:text-sm text-blue-600 mb-2">Total Contract Value</div>
                  <div className="text-xl md:text-2xl font-bold text-blue-700">
                    GHS {stats.totalValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create view: add buttons, then filters + list (same theme as Invoice) */}
          {currentView === "create" && (
            <>
              <div className="mb-6 gap-4 flex flex-wrap">
                <button onClick={() => newContract("graphic")} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition bg-blue-500 text-white hover:bg-blue-600 shadow-md">
                  <Briefcase size={20} /> + Design Contract
                </button>
                <button onClick={() => newContract("merch")} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300">
                  <Scissors size={20} /> + Merch Contract
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ background: "#111", color: "#fff", padding: "0 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: BRAND.red, lineHeight: 1 }}>CGY</span>
              <div style={{ width: 1, height: 28, background: "#333" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Contract Manager</div>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>Curio Graphics Yard</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => newContract("graphic")} style={{ background: BRAND.red, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Briefcase size={15} /> + Design Contract
              </button>
              <button onClick={() => newContract("merch")} style={{ background: BRAND.gold, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Scissors size={15} /> + Merch Contract
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={matchInvoiceUI ? undefined : { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }} className={matchInvoiceUI ? "max-w-6xl mx-auto px-4 py-4 md:py-8" : ""}>
        {/* When matchInvoiceUI, stat cards only in Statistics tab; show filters+list only in Create tab */}
        {(!matchInvoiceUI || currentView === "create") && (
        <>
        {/* STAT CARDS — only when !matchInvoiceUI (stats are in Statistics view when matchInvoiceUI) */}
        {!matchInvoiceUI && (
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Total Contracts", value: stats.total, color: "#111", bgClass: matchInvoiceUI ? "bg-gray-50" : null },
            { label: "Design Contracts", value: stats.graphic, color: BRAND.red, bgClass: matchInvoiceUI ? "bg-red-50" : null },
            { label: "Merch Contracts", value: stats.merch, color: BRAND.gold, bgClass: matchInvoiceUI ? "bg-amber-50" : null },
            { label: "Signed / Active", value: stats.signed, color: "#16a34a", bgClass: matchInvoiceUI ? "bg-green-50" : null },
            { label: "Drafts", value: stats.draft, color: "#9ca3af", bgClass: matchInvoiceUI ? "bg-gray-50" : null },
            { label: "Total Contract Value", value: `GHS ${stats.totalValue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#2563eb", small: true, bgClass: matchInvoiceUI ? "bg-blue-50" : null },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: s.small ? 16 : 28, fontWeight: 700, color: s.color, fontFamily: s.small ? "inherit" : "'DM Serif Display', serif", lineHeight: 1.1 }}>{s.value}</div>
            </div>
          ))}
        </div>
        )}

        {/* FILTERS */}
        <div className="filter-row" style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", pointerEvents: "none" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client, #, or project..."
              style={{ width: "100%", border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 14px 10px 36px", fontSize: 14, outline: "none", background: "#fff" }} />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, background: "#fff", cursor: "pointer" }}>
            <option value="all">All Types</option>
            <option value="graphic">Graphic Design</option>
            <option value="merch">Merch Design</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ border: "2px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, background: "#fff", cursor: "pointer" }}>
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* CONTRACTS LIST */}
        {filtered.length === 0 ? (
          <div className={matchInvoiceUI ? "text-center py-16 px-6 bg-white rounded-lg shadow-sm" : ""} style={matchInvoiceUI ? undefined : { textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 12 }}>
            <p className={matchInvoiceUI ? "text-gray-600 text-base mb-6" : ""} style={matchInvoiceUI ? undefined : { color: "#aaa", fontSize: 16, marginBottom: 24 }}>
              {contracts.length === 0 ? "No contracts yet. Create your first one!" : "No contracts match your filters."}
            </p>
            <div className={matchInvoiceUI ? "flex gap-3 justify-center flex-wrap" : ""} style={matchInvoiceUI ? undefined : { display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => newContract("graphic")} className={matchInvoiceUI ? "flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 shadow-md transition" : ""} style={matchInvoiceUI ? undefined : { background: BRAND.red, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                <Briefcase size={20} /> + Design Contract
              </button>
              <button onClick={() => newContract("merch")} className={matchInvoiceUI ? "flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 transition" : ""} style={matchInvoiceUI ? undefined : { background: BRAND.gold, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                <Scissors size={20} /> + Merch Contract
              </button>
            </div>
          </div>
        ) : (
          <div className={matchInvoiceUI ? "flex flex-col gap-3" : ""} style={matchInvoiceUI ? undefined : { display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(c => {
              const typeInfo = CONTRACT_TYPES[c.type];
              const deposit = c.agreedAmount ? ((parseFloat(c.agreedAmount) * c.depositPercent) / 100).toFixed(2) : "—";
              return (
                <div key={c.id} className={`contract-card ${matchInvoiceUI ? "bg-white rounded-lg shadow-sm p-4 md:p-5 border-l-4 flex items-center gap-5" : ""}`} style={matchInvoiceUI ? { borderLeftColor: typeInfo.color } : { background: "#fff", borderRadius: 12, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: `4px solid ${typeInfo.color}`, display: "flex", alignItems: "center", gap: 20 }}>
                  {/* Type icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: typeInfo.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {c.type === "graphic" ? <Briefcase size={20} color={typeInfo.color} /> : <Scissors size={20} color={typeInfo.color} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{c.projectTitle || "Untitled Project"}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#888", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={12} /> {c.clientName || "—"}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={12} /> {c.contractNumber}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {fmtDate(c.contractDate)}</span>
                      <span style={{ color: typeInfo.color, fontWeight: 600 }}>{c.currency} {c.agreedAmount ? parseFloat(c.agreedAmount).toLocaleString() : "—"}</span>
                    </div>
                    {c.servicesSelected.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {c.servicesSelected.slice(0, 3).map(s => (
                          <span key={s} style={{ fontSize: 10, background: "#f3f4f6", color: "#555", padding: "2px 8px", borderRadius: 20 }}>{s}</span>
                        ))}
                        {c.servicesSelected.length > 3 && <span style={{ fontSize: 10, color: "#aaa" }}>+{c.servicesSelected.length - 3} more</span>}
                      </div>
                    )}
                  </div>

                  {/* Deposit pill */}
                  <div className="desktop-only" style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>Deposit</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{c.currency} {deposit}</div>
                    <div style={{ fontSize: 10, color: "#aaa" }}>{c.depositPercent}%</div>
                  </div>

                  {/* Actions */}
                  <div className="contract-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => editContract(c)} title="Edit" className="action-btn"
                      style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => generateContractPDF(c)} title="Export PDF" className="action-btn"
                      style={{ background: typeInfo.color, color: "#fff", border: "none", borderRadius: 7, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                      <Download size={14} /> PDF
                    </button>
                    <button onClick={() => duplicateContract(c)} title="Duplicate" className="action-btn"
                      style={{ background: "#f3f4f6", color: "#555", border: "1px solid #e5e7eb", borderRadius: 7, padding: "8px 10px", cursor: "pointer" }}>
                      <Copy size={14} />
                    </button>
                    <button onClick={() => deleteContract(c.id)} title="Delete" className="action-btn"
                      style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 7, padding: "8px 10px", cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom spacer for mobile */}
        <div style={{ height: 80 }} />
        </>
        )}
      </div>

      {/* MOBILE BOTTOM NAV — only when !matchInvoiceUI */}
      {!matchInvoiceUI && (
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e5e7eb", padding: "8px 16px 12px", zIndex: 100 }}
        className="mobile-nav md:hidden">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <button onClick={() => newContract("graphic")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: BRAND.red, fontSize: 11, fontWeight: 600 }}>
            <Briefcase size={22} /><span>Design</span>
          </button>
          <button onClick={() => newContract("merch")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: BRAND.gold, fontSize: 11, fontWeight: 600 }}>
            <Scissors size={22} /><span>Merch</span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
