# HeatShield AI — Smart Heat-Risk Monitoring and Duty Planner

**Theme:** AI for Climate Change  
**Hackathon:** Indradhanu 2026  
**Primary Beneficiaries:** Traffic Police, Outdoor Municipal Workers, Citizens, and Urban Disaster Management Authorities.

---

## 1. Project Purpose & Problem Statement

Urban asphalt and concrete trap solar radiation, creating extreme microclimates up to 3°C to 5°C hotter than reported ambient temperatures. In rapidly urbanizing regions and global heatwave hotspots, traffic police, gig workers, construction laborers, and sanitation staff suffer high rates of heat exhaustion, dehydration, and life-threatening heat strokes.

**HeatShield AI** is an end-to-end climate-tech intelligence dashboard that monitors localized junction heat risks, predicts thermal stress using transparent formulas, optimizes outdoor duty rosters (mandatory rest breaks, hydration targets, staff rotation), prioritizes municipal cooling infrastructure investments, and provides real-time grounded safety advice via a Gemini-powered AI assistant.

---

## 2. Key Features

- **Global Location Selector:** Select any city, state/province, or country worldwide via autocomplete search, coordinates, or browser GPS.
- **Microclimate Heat-Risk Monitoring:** Default 5 Pune demonstration junctions (*Shivaji Nagar Signal, Swargate Junction, University Circle, Kothrud Depot Signal, Hadapsar Gadital*) with real-time risk scores (0–100), risk tiers (*Low: 0–44, Moderate: 45–74, High: 75–100*), and immediate recalculation when temperature or humidity values change.
- **Interactive Spatial Map:** Leaflet GIS map with OpenStreetMap tiles, colored markers by risk severity, clickable popups, and selected-junction inspector.
- **Smart Duty Planner:** Algorithmic shift rosters, mandatory shaded rest intervals (e.g. 15 min every 45 min in High Risk), hydration targets (e.g. 600 ml/hr with ORS), supervisor review workflows (*Approved, Pending Review, Action Required*), and interactive task checklists.
- **Cooling Infrastructure Priorities:** Ranked list of municipal intervention sites for drinking-water kiosks, solar misting canopies, air-cooled transit kiosks, and emergency ORS medical standbys.
- **AI Safety Assistant:** Grounded chatbot providing occupational heat-safety guidance. Powered by Gemini 3.8 Flash (`@google/genai` server-side SDK) with automatic transparent rule-based fallback when keys are absent.
- **Weather Processing & Scenario Simulator:** Real-time simulation of extreme heatwaves with input validation, data normalization, and transparent formula breakdowns.
- **CSV Report Export:** Generates and downloads standard CSV risk audits directly in the browser.
- **Nugen API Integration Hub:** Standardized telemetric pipeline specification and test serializer for Indradhanu 2026 hackathon data exchange.
- **Authentication Portal:** Role-based login and registration (*Traffic Police, Outdoor Worker, Administrator, Citizen*) with password validation.

---

## 3. System Flow Architecture

```
Weather Data & Location (Open-Meteo / GPS / Sensor Inputs)
                      ↓
          Data Processing & Normalization
    (Bounds Validation, Microclimate UHI Weighting)
                      ↓
             Heat-Risk Calculation
    (Temp Factor + Humidity Factor + Traffic - Shade)
                      ↓
              Risk Classification
      (Low: 0-44 | Moderate: 45-74 | High: 75-100)
                      ↓
     Interactive Map & AI Safety Assistant
   (Leaflet GIS & Server-side Gemini 3.8 Flash)
                      ↓
               Smart Duty Planner
     (Rotation Cycles, Shaded Breaks & Hydration)
                      ↓
            Alerts & Facility Priorities
       (Misting Canopies, Water Kiosks, ORS)
                      ↓
           Citizens & Civic Authorities
```

---

## 4. Frontend & Backend Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Leaflet GIS.
- **Backend Entry Point (`server.ts`):** Express full-stack server running Vite middlewares in development mode on port 3000.
- **Server-Side API Routes:**
  - `POST /api/ai/chat`: Secure server-side `@google/genai` handler using `gemini-3.8-flash` model.
  - `GET /api/ai/status`: Inspects whether `GEMINI_API_KEY` is present.
  - `GET /api/weather/lookup`: Proxies Open-Meteo live weather and geocoding.
  - `GET /api/nugen/health`: Nugen architectural contract verification.
  - `POST /api/nugen/telemetry/simulate`: Serializes IoT sensor payloads.

---

## 5. Environment Variables

Create or configure `.env` (refer to `.env.example`):

| Variable | Description | Default / Fallback |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-side Gemini AI API key | Grounded rule-based demo assistant |
| `PORT` | Web server listening port | `3000` |
| `APP_URL` | Cloud Run or hosting URL | Auto-injected in production |
| `NUGEN_API_KEY` | Key for Indradhanu 2026 Nugen gateway | Architectural sandbox preview |

---

## 6. How to Run the Application

```bash
# Install dependencies
npm install

# Start development server (Node + Express + Vite on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## 7. Live vs. Demo Mode Disclosure

In strict alignment with the Indradhanu 2026 evaluation criteria:
- **Functional in Demo Mode:** All calculations, duty planner modifications, task checklist toggling, global search, CSV downloads, Leaflet map spatial visualizations, and rule-based chat recommendations work out-of-the-box without external keys.
- **Requires Credentials:** Live Gemini 3.8 Flash AI generation activates automatically when `GEMINI_API_KEY` is provided in environment secrets. Nugen IoT telemetry connects when `NUGEN_API_KEY` is bound.
- **Replacing Simulated Data:** The application automatically queries live Open-Meteo satellite feeds for any city searched. When network is offline, it falls back gracefully to calibrated Pune baseline datasets with explicit labeling.
