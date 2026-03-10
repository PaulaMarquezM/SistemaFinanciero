# Sistema Financiero — Financial Management Platform

> A full-stack financial management web application built with React 19, TypeScript, and Vite. Designed for managing credits, customers, asset depreciation, loan amortization, and generating professional financial reports.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

---

## Overview

**Sistema Financiero** is a comprehensive financial management platform developed as a collaborative academic project. It covers core areas of financial administration including credit management, customer tracking, asset depreciation, and loan amortization — all within a polished, production-ready interface.

The application integrates with a REST API backend and supports PDF/Excel report generation, interactive charts, and drag-and-drop UI components.

---

## Features

| Module | Description |
|---|---|
| **Authentication** | Login & Registration with route-level protection |
| **Dashboard** | Overview with KPIs and charts via Recharts |
| **Customers** | Full CRUD for client management |
| **Credits** | Credit creation, tracking, and interest calculation |
| **Simple & Compound Interest** | Configurable interest calculators with printable results |
| **Loan Amortization** | Amortization schedule generator with table export |
| **Asset Depreciation** | Depreciation models with visual breakdown |
| **Collections Report** | Accounts receivable report with PDF export |

**Additional capabilities:**
- PDF generation with `jsPDF` + `jspdf-autotable`
- Excel export with `xlsx`
- Interactive, sortable UI with `@dnd-kit`
- Responsive layout with custom CSS Modules

---

## Tech Stack

**Frontend**
- [React 19](https://react.dev/) — UI library with the new React Compiler enabled
- [TypeScript 5.9](https://www.typescriptlang.org/) — Static typing throughout
- [Vite 7](https://vitejs.dev/) — Lightning-fast build tooling
- [React Router DOM v7](https://reactrouter.com/) — Client-side routing
- [Recharts](https://recharts.org/) — Composable charting library
- [Lucide React](https://lucide.dev/) — Icon system

**Data & Utilities**
- [Axios](https://axios-http.com/) — HTTP client for REST API communication
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — PDF report generation
- [xlsx](https://github.com/SheetJS/sheetjs) — Spreadsheet export
- [file-saver](https://github.com/eligrey/FileSaver.js/) — Client-side file download
- [@dnd-kit](https://dndkit.com/) — Accessible drag-and-drop

**Dev Tools**
- ESLint 9 with TypeScript-aware rules
- Babel Plugin React Compiler

---

## Architecture

```
src/
├── api/                  # Axios API clients (auth, financial)
├── components/
│   ├── layout/           # MainLayout, Sidebar, TopBar
│   └── depreciacion/     # Depreciation-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and helpers
├── pages/                # Route-level page components
│   ├── DashboardPage
│   ├── CustomersPage
│   ├── CreditsPage
│   ├── SimpleInterestPage
│   ├── AmortizationPage
│   ├── DepreciationPage
│   ├── LoginPage
│   └── RegisterPage
├── theme/                # Global theme tokens and styles
├── types/                # Shared TypeScript interfaces
└── App.tsx               # Router setup with auth guards
```

**Routing strategy:** Protected routes via a `RequireAuth` wrapper that checks `localStorage` for a session token. Public routes (`/login`, `/register`) are accessible without authentication.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/sistema-financiero.git
cd sistema-financiero

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## Project Structure

This project follows a **feature-adjacent** structure where each page component owns its UI and connects to shared API clients and hooks. CSS Modules are used for scoped component styling, and global theme tokens are centralized in `src/theme/`.

---

## Screenshots

> _Screenshots or a demo GIF can be added here to showcase the interface._

---

## License

This project was developed for academic purposes. All rights reserved by the contributors.
