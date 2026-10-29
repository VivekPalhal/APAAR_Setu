# APAAR Setu — UI/UX Design Specification

**Direction:** Clean, minimal, light-first. Deep indigo accent. Built for officers who scan, decide, and move on.
**Principle:** *Show what needs attention first, then the numbers.* No decoration that does not carry meaning.

---

## 1. Design Principles

1. **Action before analytics.** Every home screen opens with what the user must do, then supporting numbers.
2. **One clear result.** Verification, validation, and query screens end in a single unambiguous state.
3. **Explain, don't just score.** Any score, flag, or answer has a "why" one click away.
4. **Quiet interface.** Neutral surfaces, one accent, colour reserved for status. No gradients, glassmorphism, or illustration filler.
5. **Dense where experts work, spacious where citizens work.** Compact tables for AICTE and institutions; large, simple layouts for students and employers.
6. **Accessible and multilingual by default.** WCAG 2.2 AA, keyboard-first, i18n-ready (English, Hindi, regional).

What keeps it from looking "AI generated": real data states instead of placeholder cards, restrained type scale, consistent 4 px spacing, no random emoji or icon clusters, and copy written like a government tool a clerk can trust ("14 rows need correction") rather than marketing.

---

## 2. Visual System

### 2.1 Colour tokens

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | `#FAFAF9` | `#0F1115` | App background |
| `--surface` | `#FFFFFF` | `#171A21` | Cards, tables |
| `--surface-2` | `#F4F4F2` | `#1E222B` | Table headers, hover |
| `--border` | `#E6E5E1` | `#2A2F3A` | Hairlines |
| `--text` | `#1B1D23` | `#ECEDEF` | Primary text |
| `--text-muted` | `#6B6F7A` | `#9AA0AC` | Secondary text |
| `--accent` | `#3730A3` | `#8B8CF5` | Primary actions, active nav |
| `--accent-soft` | `#EEF0FF` | `#23264A` | Selected rows, chips |
| `--ok` | `#15803D` | `#4ADE80` | Verified, passed |
| `--warn` | `#B45309` | `#FBBF24` | Needs review |
| `--crit` | `#B91C1C` | `#F87171` | Critical, revoked |

Rule: **colour means status only.** The accent is for interaction; green/amber/red are never used decoratively. Status is always paired with text or an icon, never colour alone.

### 2.2 Typography
- **Inter** for UI. **JetBrains Mono** (or IBM Plex Mono) for APAAR IDs, institution codes, hashes, and SQL.
- Scale: 12 / 13 / 14 (base) / 16 / 20 / 28. Weights 400, 500, 600 only.
- Tabular numerals (`font-variant-numeric: tabular-nums`) in all tables and counters.
- IDs are always grouped for readability: `4821 7730 2915`.

### 2.3 Spacing, shape, elevation
- 4 px base grid; component padding 12/16/24.
- Radius: 6 px controls, 10 px cards. No large pill shapes.
- Elevation: hairline borders by default; a single soft shadow only for menus and dialogs.
- Motion: 120–180 ms ease-out for state changes; respects `prefers-reduced-motion`. No decorative animation.

### 2.4 Iconography
Lucide, 16/20 px, stroke 1.5. Icons always accompany a label in navigation; icon-only buttons have tooltips and aria-labels.

---

## 3. Layout and Navigation

**Shell:** fixed left sidebar (240 px, collapsible to 64 px) + top bar.

```
┌──────────┬──────────────────────────────────────────────────────┐
│ APAAR Setu │  [ Ask APAAR Setu…  ⌘K ]      EN ▾   ◐   🔔   Name ▾   │
│          ├──────────────────────────────────────────────────────┤
│ ▸ Home   │  Page title                         [Primary action] │
│   Alerts │  ──────────────────────────────────────────────────  │
│   Insts  │                                                      │
│   Query  │              Content (max-width 1280)                │
│   Reports│                                                      │
│   Audit  │                                                      │
│   Rules  │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

- Top bar: global ask bar / command palette, language switch, theme toggle, notifications, profile.
- Breadcrumbs under the title for deep screens.
- Navigation items are role-filtered; users never see disabled menu items for areas they can't access.

### Navigation by role

| Role | Sidebar |
|------|---------|
| AICTE Super Admin | Home, Alerts, Institutions, Ask, Reports, Rules, Users & Keys, Audit |
| AICTE Regulator | Home, Alerts, Institutions, Ask, Reports, Audit |
| Institution Admin | Home, Upload, Students, Corrections, Users, Certificates |
| Data Operator | Upload, Students, Corrections |
| Student | My record, Shares & consent, Activity |
| Employer / Verifier | None (single page, no login) |

---

## 4. Key Screens

### 4.1 AICTE Home — action-first

```
Needs attention                                            View all →
┌───────────────────────────────────────────────────────────────────┐
│ ● Critical  Over-intake: 12 programmes exceed approved seats  Review│
│ ● Critical  38 students enrolled at two institutions          Review│
│ ● Warning   9 institutions with trust score drop > 10 pts     Review│
│ ● Info      4 corrections awaiting your approval              Open  │
└───────────────────────────────────────────────────────────────────┘

Today                                  Admissions this cycle
 Students verified   1,048,213          [ line chart, 2025-26 vs 2024-25 ]
 Pending validation       2,310
 Open anomalies             187
 Institutions reporting  11,942 / 15,106  [ progress ]
```

Rules: the attention list is sorted by severity then age; each row is a single sentence with a count, and one click opens a pre-filtered view. Numbers below are plain, with a small sparkline at most.

### 4.2 Institution Upload — guided stepper with live progress

Steps: **1 Choose file → 2 Map columns → 3 Validate → 4 Review issues → 5 Submit**

- Step 1: drag-and-drop or pick file; also shows "Download template" and "Use API instead".
- Step 2: auto-mapped columns with confidence marks; only unmapped required fields need action.
- Step 3: live progress via SSE: rows processed, passed, flagged, with an ETA. The user can leave; progress persists.
- Step 4: grouped issues ("42 invalid APAAR IDs", "8 duplicate rows"), each with inline fix, bulk fix, or "export error file".
- Step 5: summary diff ("1,240 new, 37 updated, 0 removed"), then submit. A receipt with a batch ID is shown.

Empty/error states have specific next actions, never "Something went wrong".

### 4.3 Anomaly / Review screen
Split view: left, compact table of flagged items (score, subject, rule/method, age); right, evidence panel with score breakdown, peer comparison bar, affected rows, and a timeline of comments. Actions: *Request correction*, *Approve*, *Dismiss with reason*, *Escalate*. Keyboard: `J/K` move, `A` approve, `R` request correction.

### 4.4 Institution detail (AICTE view)
Header: name, AICTE code (mono), status. Tabs: Overview · Programmes · Anomalies · Trust score · History. Trust score shows the number and a **component breakdown** with small horizontal bars; it is hidden entirely from institution users.

### 4.5 Ask APAAR Setu — transparent answers
Ask bar at top of every AICTE page (`⌘K`). The answer view has three parts:

1. **Answer:** a short sentence, plus a table or chart.
2. **How I got this:** collapsible panel showing interpreted question ("Institutions where enrolled > approved intake, state = Maharashtra, year = 2025-26"), filters, the exact query, and row count.
3. **Follow-ups:** 2–3 suggested refinements.

If the question is ambiguous, it asks one clarifying question instead of guessing. Results can be exported or saved as a report.

### 4.6 Employer verification page (mobile-first, no login)
Opened from QR. One screen, one result.

```
┌────────────────────────────┐
│  ✓  Verified               │   large status, green text + icon
│  Enrolment confirmed       │
│                            │
│  Programme   B.Tech CSE    │   only the claims the student shared
│  Status      Active        │
│  Year        2025-26       │
│                            │
│  Issued by AICTE · 12 Aug  │
│  Signature valid · Not revoked │
│  ─────────────────────────  │
│  Checked offline ⓘ         │   shown when no network
└────────────────────────────┘
```

Other results use the same layout with a different headline: **Revoked**, **Expired**, **Not valid** (signature failed). Fail states state what to do ("Ask the student for a new link"). No ads, no clutter, no login prompt, works at 360 px width, loads under 100 KB.

### 4.7 Student dashboard
Plain language and large targets. Sections: **My record**, **Who can see what** (consent ledger with a revoke button per entry), **Share** (choose claims → generates QR/link with expiry), **Activity** (who verified, when). The sharing flow shows a live preview of exactly what the verifier will see.

### 4.8 Rules & Audit (Super Admin)
Rules: table of rules with version, severity, active toggle; editing opens a side panel with a diff against the previous version and requires a reason. Audit: filterable log with a persistent "Chain verified ✓ · head hash `a91f…`" indicator.

---

## 5. Components

- **Data table:** compact (32 px rows) and comfortable (44 px) density; sticky header; column resize/hide; keyboard navigation; saved views; virtualised for 100k+ rows; row expansion for details; CSV export.
- **Status badge:** text + dot; variants ok / warn / crit / neutral.
- **Risk meter:** thin horizontal bar 0–100 with numeric value, never a gauge or speedometer.
- **Stepper:** numbered, shows done / current / error; progress inside the current step.
- **Evidence panel:** key-value list, small bars for peer comparisons.
- **Consent card:** claim list, purpose, expiry, revoke.
- **ID chip:** mono text, copy-on-click, masked variants.
- **Toast:** bottom-left, only for confirmations; errors stay inline.

---

## 6. Theme and Density
- **Light by default**, dark option in the top bar (also follows system if the user hasn't chosen).
- **Compact tables** toggle per table, remembered per user.
- Charts use the same tokens; two-series maximum by default with a single accent plus a neutral grey.

---

## 7. Content and Language
- Sentence case, plain verbs, numbers first ("38 students enrolled at two institutions").
- Dates in `DD MMM YYYY`; numbers in the Indian grouping (`10,48,213`) when the locale is Hindi/regional.
- All strings externalised; layouts tolerate 30–40% text expansion; fonts: Noto Sans Devanagari and other Noto scripts as fallbacks.

---

## 8. Accessibility
- WCAG 2.2 AA contrast; focus rings always visible (2 px accent).
- Full keyboard operation; skip link; logical tab order; ARIA live regions for upload progress and alerts.
- Status never by colour alone; charts have data-table alternatives.
- Targets ≥ 44 px on mobile; supports 200% zoom and screen readers.

---

## 9. Responsive Behaviour

| Breakpoint | Behaviour |
|------------|-----------|
| ≥ 1280 | Full sidebar, split views |
| 768–1279 | Collapsed sidebar, stacked split views |
| < 768 | Bottom navigation for student; verifier page full-screen; staff screens read-only summaries with "open on desktop" for heavy tasks |

---

## 10. Page-by-Page States

Every screen defines: **loading** (skeleton rows, not spinners), **empty** (what this is and the first action), **error** (cause and the next step), **partial** (some data available), and **permission denied** (who to ask).

---

## 11. Frontend Architecture (summary)
Next.js App Router, TypeScript, Tailwind with the tokens above as CSS variables, shadcn/ui primitives restyled to this system, TanStack Table + Virtual, TanStack Query for data, SSE hook with polling fallback, `next-intl` for i18n, Playwright + axe-core in CI for visual and accessibility checks.

---

## 12. Demo Script for the UI (what judges should see)
1. AICTE home opens on the attention list (action-first).
2. Institution uploads a CSV; stepper shows live validation and flags a duplicate.
3. Regulator opens the anomaly, reads the evidence, requests correction.
4. Regulator asks: "Which institutions exceeded intake?" and expands "How I got this".
5. Student shares only programme + status; employer scans and sees a single green result on a phone.
6. Toggle dark mode and compact density to show the system is consistent.
