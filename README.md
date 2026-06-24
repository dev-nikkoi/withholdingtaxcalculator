# Pastel TaxDesk — Withholding Tax Calculator

A dark and pastel pink web development project inspired by online withholding tax calculator workflows. It is built with **HTML, CSS, and vanilla JavaScript** only, so it is easy to deploy as a static website.

## Features

- Compensation withholding tax calculator
- Expanded withholding tax percentage calculator
- Dark + pastel pink responsive design
- Tax computation breakdown
- Reference tax table viewer
- Copy result button
- Save calculation scenarios in browser localStorage
- No backend and no database required

## Files

```text
pastel-tax-calculator/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How to run locally

### Option 1: Open directly

1. Extract the ZIP file.
2. Open the folder.
3. Double-click `index.html`.

### Option 2: Use VS Code Live Server

1. Install Visual Studio Code.
2. Install the **Live Server** extension.
3. Open the extracted project folder in VS Code.
4. Right-click `index.html`.
5. Click **Open with Live Server**.

### Option 3: Use Python local server

From inside the project folder, run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to deploy

### Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md`.
3. Go to **Settings** → **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Click **Save**.
7. Wait for GitHub to publish your site.

### Deploy to Netlify

1. Go to Netlify.
2. Choose **Add new site** → **Deploy manually**.
3. Drag and drop the extracted project folder.
4. Netlify will publish the static site automatically.

### Deploy to Vercel

1. Go to Vercel.
2. Create a new project.
3. Import your GitHub repository or upload the project.
4. Use default static project settings.
5. Deploy.

## Calculation notes

The compensation withholding table inside `script.js` follows the **Revised Withholding Tax Table effective January 1, 2023 onwards** from BIR Annex E. This project is for learning and portfolio use only. Always verify official tax requirements before using calculations for real payroll, filing, or compliance.

## Suggested improvements for your portfolio

- Add login and role-based access for HR/payroll staff.
- Add employee masterlist and payroll batch computation.
- Export calculations to CSV or PDF.
- Add backend storage using Firebase, Supabase, Laravel, or Node.js.
- Add unit tests for bracket calculations.
