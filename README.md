# ToolNest — Every tool. One place.

A fast, responsive, mobile-first all-in-one tools portal bringing together essential scientific, laboratory, everyday math, document, image, and developer utilities.

- **100% Client-Side**: All calculations, text processing, and image compression occur directly in the browser memory. Zero files are uploaded to any server.
- **$0 Budget Architecture**: Built using free, open-source web technologies (React 19 + Vite + TypeScript + Tailwind CSS) with zero required paid APIs or subscription services.
- **Mobile-First for Android**: Fully optimized for mobile screens, touch controls, and effortless code edits via GitHub on Android.

---

## 🛠 Implemented Tools (Phase 1 MVP + Bonus QC & Dev Utilities)

### 1. Mathematics & Everyday Calculators
- **Percentage Calculator**: 3 modes (X% of Y, X is what % of Y, and % Increase/Decrease with step-by-step arithmetic derivation).
- **Discount & Sales Tax Calculator**: Calculate initial discounts, stacked coupon codes, and local sales tax with clear savings breakdowns.
- **Universal Unit Converter**: Real-time conversions across Length, Mass, Temperature, Volume, Area, Speed, and Pressure with full tabular equivalents.
- **Tip & Bill Splitter**: Gratuity calculator and multi-person bill splitting with per-person breakdown.

### 2. Chemistry & Scientific Tools
- **Molarity Calculator**: Flexible solver for required solute mass, molarity, or solution volume using $M = \frac{m}{MW \times V}$. Includes preset reagents (NaCl, NaOH, Tris, Glucose, EDTA) and laboratory safety notices.
- **Dilution Calculator ($C_1V_1 = C_2V_2$)**: Calculates initial stock volume, target concentration, or working volume with automatic unit scaling (M, mM, µM, %, mg/mL, mL, L) and solvent addition volume.
- **Mass Concentration Calculator**: Computes and converts concentrations across g/L, mg/mL, µg/mL, ppm, and ppb with aqueous density explanations.
- **pH Calculator (Strong Acid / Base)**: Determines pH, pOH, $[H^+]$, and $[OH^-]$ for monoprotic and diprotic solutions at 25°C.

### 3. Laboratory & Analytical Quality Control
- **Mean, SD & %RSD Calculator**: Calculates arithmetic mean ($\bar{x}$), sample standard deviation ($s$), and Relative Standard Deviation (%RSD) for analytical HPLC/QC replicates data.

### 4. Image & Media Processing
- **In-Browser Image Compressor**: Compress JPEG, PNG, and WebP images locally via HTML5 Canvas with quality sliders, resolution constraint resizing, before/after previews, and instant downloads.

### 5. Developer & Text Utilities
- **JSON Formatter & Validator**: Beautify (2 or 4 spaces), minify, and validate syntax with exact error line reporting.
- **Base64 Encoder & Decoder**: UTF-8 safe bidirectional string encoding and decoding.
- **Cryptographic Password & UUID v4 Generator**: Browser-native `window.crypto.getRandomValues()` password generator with entropy measurement and RFC 4122 UUID v4 generation.
- **Word & Character Counter**: Real-time word, character (with and without spaces), sentence, line counts, estimated reading time, and speaking duration.
- **Text Case Converter**: 10 casing transformations (UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, PascalCase, etc.).

### 6. Education & Time
- **Date Difference Calculator**: Precise duration between dates in years, months, days, total weeks, business days, and hours with inclusive/exclusive toggles.
- **Exact Age & Milestone Calculator**: Exact age, next birthday countdown, day of the week of birth, and total days lived.
- **Digital Precision Stopwatch**: Millisecond chronometer with lap recording, fastest/slowest lap highlighting, and keyboard shortcuts (`Space`, `L`, `R`).

---

## 🚀 How to Run & Test Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the local Vite development server
npm run dev

# 3. Open in your browser
# Navigate to http://localhost:3000
```

---

## 📱 Beginner Guide: Managing & Deploying from an Android Mobile Phone for $0

You can run and maintain this entire website from an Android phone without needing a computer or spending any money.

### Option A: 1-Click Free Hosting on Vercel (Recommended)

1. **Create your free GitHub repository on your Android phone:**
   - Open Chrome on Android and visit [github.com](https://github.com). Log into your account.
   - Tap the **+** (plus icon) in the top-right corner $\rightarrow$ select **New repository**.
   - Repository name: `toolnest`
   - Select **Public** $\rightarrow$ tap **Create repository**.

2. **Push the code to GitHub:**
   - In Google AI Studio, tap the **Export to GitHub** or **Share** button in the top menu.
   - Authorize GitHub and select your new `toolnest` repository.
   - Your code will be automatically committed and pushed.

3. **Deploy on Vercel for free:**
   - On your Android phone, go to [vercel.com](https://vercel.com) and tap **Sign up with GitHub**.
   - Tap **Add New... $\rightarrow$ Project**.
   - Select your `toolnest` repository from the list.
   - Vercel automatically detects Vite + React. Keep all default build settings as:
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Tap **Deploy**.
   - Within 30–60 seconds, your website is live worldwide with a free permanent HTTPS address:
     `https://toolnest.vercel.app` (or custom name chosen in Vercel settings).

---

### Option B: Free Hosting on GitHub Pages

1. If you prefer GitHub Pages:
   - In `vite.config.ts`, set the base path to your repo name:
     ```typescript
     export default defineConfig({
       base: '/toolnest/',
       // ...
     });
     ```
   - In your GitHub repository on mobile, go to **Settings** $\rightarrow$ **Pages** $\rightarrow$ Under **Build and deployment**, select **Source: GitHub Actions** $\rightarrow$ choose the **Static HTML** template.
   - Your site will be published at:
     `https://<YOUR_GITHUB_USERNAME>.github.io/toolnest/`
     *(Replace `<YOUR_GITHUB_USERNAME>` with your actual GitHub username).*

---

### ✏️ How to Edit Code Directly on Android Phone
Whenever you want to add a new tool or edit formulas:
1. Open Chrome on your phone $\rightarrow$ go to `https://github.com/<YOUR_GITHUB_USERNAME>/toolnest`.
2. Tap on any file (e.g. `src/data/tools.ts` or `src/tools/math/PercentageCalculator.tsx`).
3. Tap the **Pencil icon** (Edit this file).
4. Make your edits and scroll to the bottom.
5. Tap **Commit changes**.
6. Vercel automatically detects the commit and redeploys your site in under 30 seconds!

---

## 🛡️ Privacy & Compliance Notice
- **100% In-Browser Execution**: All calculations and image file compressions occur inside the user's browser memory via JavaScript and HTML5 Canvas.
- **Laboratory Safety**: Laboratory calculations and pharmaceutical tools are educational calculation aids. Official preparation must always follow approved standard operating procedures (SOPs), Safety Data Sheets (SDS), and pharmacopeial standards (USP/BP/Ph. Eur./ICH).
