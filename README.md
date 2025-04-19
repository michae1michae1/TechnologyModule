# Air Force Energy Technology Dashboard

A single-page, full-screen dashboard UI for Air Force energy managers to explore, analyze, and compare technologies that support base-level energy resiliency.

## Features

- **FilterBar**: Multi-select dropdowns for filtering by Installation, Technology Type, Vendor, and Status
- **MapView**: Interactive map showing Air Force installations with technologies
- **TechTable**: Sortable and filterable data table with all technology records
- **DetailsPane**: Slide-in panel with detailed information about a selected technology
- **CompareSection**: Side-by-side comparison of up to 3 technologies

## Tech Stack

- **Next.js 15** (App Router) — SSR + static export
- **React 19 + TypeScript** — strict typing
- **TailwindCSS** — modern utility styling
- **Radix UI** — accessible components (Dialog, Select, Tabs, etc.)
- **Framer Motion** — transitions, slide-ins, hover animations

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/src
  /app
    layout.tsx         ← global layout wrapper
    page.tsx           ← main dashboard
  /components          ← reusable UI primitives
  /modules             ← core sections: FilterBar, MapView, TechTable, DetailsPane, CompareSection
  /data                ← mock JSON files
  /hooks               ← custom React hooks (state, filtering)
  /context             ← FilterContext, CompareContext, DetailsContext
  /types               ← TypeScript type definitions
```

## Global State

The application uses React Context for global state management:

- **FilterContext**: Manages filter selections across components
- **CompareContext**: Tracks technologies selected for comparison (max 3)
- **DetailsContext**: Controls visibility and selection for the details panel

## Mock Data

The application uses mock data stored in JSON format to simulate real-world energy technology information.

## Building for Production

```bash
npm run build
```

This will generate a static export that can be deployed to GitHub Pages or any static hosting service. 