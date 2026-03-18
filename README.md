# LinkedIn Analyzer

A full-stack React application with a Node.js/Express backend that proxy fetches and displays real-time LinkedIn post analytics data. 

## Features

- **Auto-Fetch LinkedIn Data:** Extracts real-time `Engagement` and other analytics directly from the LinkedIn API via your personal Bearer Token and Post URN.
- **Dynamic Date Ranges:** Automatically categorizes metric data across 7, 14, 28, 90, and 365-day periods relative to the current date.
- **Express Backend Proxy:** Bypasses CORS restrictions seamlessly by proxying the LinkedIn API requests through a local Express server.
- **Beautiful UI:** Responsive styling using TailwindCSS.
- **PDF Export:** Export your visualized analytics data as a PDF report.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, Recharts.
- **Backend:** Node.js, Express, Axios, CORS.

## Getting Started

To run this project locally, you will need to start both the backend Node.js server and the frontend React application concurrently in separate terminal windows.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### 2. Backend Setup

The backend server is responsible for making the actual requests to the LinkedIn API to avoid CORS issues in the browser.

```bash
# Navigate to the backend directory
cd server

# Install backend dependencies
npm install

# Start the development server
npm run dev
```

The backend API will run on `http://localhost:3001`.

### 3. Frontend Setup

Open a new terminal window for the frontend.

```bash
# Navigate to the project root
cd Linkedin_Analyzer-main

# Install frontend dependencies
npm install

# Start the frontend build/dev server
npm run dev
```

The frontend will run on `http://localhost:5173` (or depending on the Vite port configuration).

## Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Locate the **Auto Fetch Data Manager** component at the top of the interface.
3. Input your **LinkedIn Bearer Token** (e.g., `eyJhbG...`).
4. Input the **Post URN** you want to analyze (e.g., `urn:li:share:1234567890123456789`).
5. Click **Fetch Analytics**. The React table and summary section will automatically populate with fetching values.

## Notes
- Ensure your Bearer Token is valid and has not expired.
- Valid Post URN formats usually look like `urn:li:share:<id>` or `share:urn:li:share:<id>`.
