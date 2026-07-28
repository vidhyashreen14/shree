# VistaHealth Pro — Web Application

> A role-based, multi-tenant hospital management system built with React 19, TanStack Router, TanStack Query, and Vite.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Routing](#routing)
- [State Management](#state-management)
- [UI & Styling](#ui--styling)
- [Role-Based Access Control](#role-based-access-control)
- [Environment Variables](#environment-variables)

---

## Overview

**VistaHealth Pro** is a comprehensive, role-based hospital management platform. The web application supports multiple user roles including:

| Role         | Description                                                           |
| ------------ | --------------------------------------------------------------------- |
| `superadmin` | Platform-level administration (hospitals, subscriptions, modules)     |
| `admin`      | Hospital-level administration (staff, billing, departments, settings) |
| `doctor`     | Patient management, prescriptions, schedule, queue                    |
| `nurse`      | Queue management, vitals recording                                    |
| `frontdesk`  | Appointment booking, patient registration, billing                    |
| `pharmacy`   | Inventory, orders, billing, invoices                                  |
| `lab`        | Lab orders, report uploads                                            |

---

## 🛠 Tech Stack

### Core Framework

| Technology                                    | Version   | Purpose                 |
| --------------------------------------------- | --------- | ----------------------- |
| [React](https://react.dev/)                   | `^19.0.0` | UI library              |
| [TypeScript](https://www.typescriptlang.org/) | `^5.7.2`  | Static typing           |
| [Vite](https://vitejs.dev/)                   | `^6.0.5`  | Build tool & dev server |

### Routing

| Technology                                             | Version     | Purpose                                     |
| ------------------------------------------------------ | ----------- | ------------------------------------------- |
| [@tanstack/react-router](https://tanstack.com/router)  | `^1.96.4`   | File-based, type-safe routing               |
| [@tanstack/router-plugin](https://tanstack.com/router) | `^1.168.19` | Vite plugin for automatic route generation  |
| [@tanstack/zod-adapter](https://tanstack.com/router)   | `^1.167.0`  | Zod integration for search param validation |

### Server State & Data Fetching

| Technology                                          | Version    | Purpose                          |
| --------------------------------------------------- | ---------- | -------------------------------- |
| [@tanstack/react-query](https://tanstack.com/query) | `^5.101.2` | Async state management & caching |

### Client State Management

| Technology                               | Version  | Purpose                  |
| ---------------------------------------- | -------- | ------------------------ |
| [Zustand](https://zustand-demo.pmnd.rs/) | `^5.0.2` | Lightweight global store |

### Data Tables

| Technology                                          | Version   | Purpose                                             |
| --------------------------------------------------- | --------- | --------------------------------------------------- |
| [@tanstack/react-table](https://tanstack.com/table) | `^8.20.6` | Headless table with sorting, filtering & pagination |

### UI & Component Library

| Technology                                | Version    | Purpose                            |
| ----------------------------------------- | ---------- | ---------------------------------- |
| [shadcn/ui](https://ui.shadcn.com/)       | —          | Component system built on Radix UI |
| [Radix UI](https://www.radix-ui.com/)     | various    | Accessible headless primitives     |
| [Base UI](https://base-ui.com/)           | `^1.6.0`   | Low-level UI primitives            |
| [Lucide React](https://lucide.dev/)       | `^0.469.0` | Icon library                       |
| [@iconify/react](https://iconify.design/) | `^6.0.2`   | Extended icon set                  |

### Styling

| Technology                                                          | Version  | Purpose                         |
| ------------------------------------------------------------------- | -------- | ------------------------------- |
| [Tailwind CSS v4](https://tailwindcss.com/)                         | `^4.3.2` | Utility-first CSS framework     |
| [@tailwindcss/vite](https://tailwindcss.com/)                       | `^4.3.2` | Vite plugin for Tailwind CSS v4 |
| [tw-animate-css](https://github.com/WarningImHack3r/tw-animate-css) | `^1.4.0` | Tailwind animation utilities    |
| [class-variance-authority](https://cva.style/docs)                  | `^0.7.1` | Component variant management    |
| [clsx](https://github.com/lukeed/clsx)                              | `^2.1.1` | Conditional class names         |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge)         | `^2.6.0` | Merge Tailwind classes safely   |

### Animations

| Technology                    | Version    | Purpose                                         |
| ----------------------------- | ---------- | ----------------------------------------------- |
| [Motion](https://motion.dev/) | `^12.42.2` | Animation & gesture library (Framer Motion v12) |

### Forms & Validation

| Technology                                                          | Version   | Purpose                         |
| ------------------------------------------------------------------- | --------- | ------------------------------- |
| [React Hook Form](https://react-hook-form.com/)                     | `^7.54.2` | Performant form management      |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | `^5.4.0`  | Validation adapters (Zod)       |
| [Zod](https://zod.dev/)                                             | `^3.24.1` | Schema declaration & validation |

### Utilities & Other Libraries

| Technology                                                                  | Version   | Purpose                       |
| --------------------------------------------------------------------------- | --------- | ----------------------------- |
| [date-fns](https://date-fns.org/)                                           | `^4.1.0`  | Date utility library          |
| [recharts](https://recharts.org/)                                           | `^2.15.0` | Charting & data visualization |
| [jsPDF](https://github.com/parallax/jsPDF)                                  | `^4.2.1`  | PDF generation                |
| [react-dropzone](https://react-dropzone.js.org/)                            | `^15.0.0` | Drag & drop file uploads      |
| [embla-carousel-react](https://www.embla-carousel.com/)                     | `^8.6.0`  | Carousel component            |
| [react-day-picker](https://react-day-picker.js.org/)                        | `^10.0.1` | Date picker component         |
| [input-otp](https://github.com/guilhermerodz/input-otp)                     | `^1.4.1`  | OTP input component           |
| [canvas-confetti](https://github.com/catdad/canvas-confetti)                | `^1.9.4`  | Confetti animation            |
| [cmdk](https://cmdk.paco.me/)                                               | `^1.0.0`  | Command palette               |
| [sonner](https://sonner.emilkowal.ski/)                                     | `^1.7.1`  | Toast notifications           |
| [next-themes](https://github.com/pacocoursey/next-themes)                   | `^0.4.6`  | Dark/light theme management   |
| [vaul](https://vaul.emilkowal.ski/)                                         | `^1.1.2`  | Drawer component              |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | `^2.1.7`  | Resizable panel layouts       |

### Fonts

| Font              | Purpose                  |
| ----------------- | ------------------------ |
| Inter             | Primary UI font          |
| Plus Jakarta Sans | Secondary / heading font |

---

## 📁 Project Structure

```
frontend/web/
├── src/
│   ├── components/
│   │   ├── layout/             # App shell: Sidebar, Topbar, CommandPalette
│   │   ├── common/             # Reusable components: StatCard, DataTable, PageHeader
│   │   └── ui/                 # shadcn/ui + Radix primitives
│   ├── hooks/                  # Custom React hooks (e.g. use-mobile.tsx)
│   ├── lib/
│   │   ├── types.ts            # Domain models & TypeScript types
│   │   ├── rbac.ts             # Role-based access control logic
│   │   ├── utils.ts            # Shared utility functions
│   │   ├── store/              # Zustand stores
│   │   │   ├── auth.ts
│   │   │   ├── billing.ts
│   │   │   ├── clinical.ts
│   │   │   ├── departments.ts
│   │   │   ├── notifications.ts
│   │   │   ├── patients.ts
│   │   │   ├── staffProfiles.ts
│   │   │   ├── theme.ts
│   │   │   └── ...
│   │   └── mock/               # Mock data provider
│   ├── routes/                 # TanStack Router (file-based routing)
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── _app.tsx            # Authenticated layout route
│   │   ├── _app.admin.*        # Admin role routes
│   │   ├── _app.doctor.*       # Doctor role routes
│   │   ├── _app.nurse.*        # Nurse role routes
│   │   ├── _app.frontdesk.*    # Front Desk role routes
│   │   ├── _app.pharmacy.*     # Pharmacy role routes
│   │   ├── _app.lab.*          # Lab role routes
│   │   └── _app.superadmin.*   # Super Admin role routes
│   ├── routeTree.gen.ts        # Auto-generated route tree (do not edit)
│   ├── router.tsx              # Router + QueryClient setup
│   ├── start.tsx               # App entry point
│   ├── server.ts               # Server entry
│   └── styles.css              # Global styles & Tailwind CSS v4 config
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
└── .env                        # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>=18.x`
- **npm** `>=9.x` (or `pnpm` / `yarn`)

### Installation

```bash
# Navigate to the web directory
cd frontend/web

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` by default.

---

## 📜 Available Scripts

| Script    | Command           | Description                          |
| --------- | ----------------- | ------------------------------------ |
| `dev`     | `npm run dev`     | Start Vite development server        |
| `build`   | `npm run build`   | Type-check & build for production    |
| `preview` | `npm run preview` | Preview the production build locally |
| `lint`    | `npm run lint`    | Run ESLint on source files           |

---

## 🗺 Routing

This project uses **TanStack Router** with **file-based routing** powered by the `@tanstack/router-plugin` Vite plugin.

- Routes are defined as files inside `src/routes/`.
- The `routeTree.gen.ts` file is **auto-generated** — do not edit it manually.
- The router is wired with `QueryClient` via context for integrated data-loading patterns.
- Search params are validated with **`@tanstack/zod-adapter`** and Zod schemas.

**Route naming convention:**

| File Pattern    | Description                        |
| --------------- | ---------------------------------- |
| `__root.tsx`    | Root layout (providers, global UI) |
| `index.tsx`     | Landing / redirect page            |
| `_app.tsx`      | Authenticated layout wrapper       |
| `_app.<role>.*` | Role-specific nested routes        |

---

## 🗄 State Management

State is split between **server state** and **client state**:

| Type                 | Tool               | Usage                                        |
| -------------------- | ------------------ | -------------------------------------------- |
| Server / async state | **TanStack Query** | API data fetching, caching, invalidation     |
| Global client state  | **Zustand**        | Auth session, theme, UI state, domain stores |

**Zustand stores** are located in `src/lib/store/` and cover domains such as:
`auth`, `billing`, `clinical`, `departments`, `doctors`, `notifications`, `patients`, `staffProfiles`, `theme`, and more.

---

## 🎨 UI & Styling

- **Tailwind CSS v4** is used via the `@tailwindcss/vite` plugin (no `tailwind.config.js` needed).
- **shadcn/ui** provides the component system. Components live in `src/components/ui/` and are configured via `components.json`.
- **Radix UI** primitives underpin all shadcn/ui components for accessibility.
- **Motion (Framer Motion v12)** handles animations and page transitions.
- **CSS Variables** are used for theming (dark / light mode via `next-themes`).
- Icons are provided by **Lucide React** and **Iconify**.

---

## 🔐 Role-Based Access Control

RBAC logic is centralized in `src/lib/rbac.ts`. Route-level access control is enforced within layout/route components using the authenticated user role from the Zustand `auth` store.

Supported roles: `superadmin` · `admin` · `doctor` · `nurse` · `frontdesk` · `pharmacy` · `lab`

---

## ⚙️ Environment Variables

Create a `.env` file in `frontend/web/` (already present). Vite exposes variables prefixed with `VITE_` to the client:

```env
VITE_API_BASE_URL=https://api.your-backend.com
# Add other environment-specific variables here
```

---

## 📄 License

This project is private and proprietary. All rights reserved.
