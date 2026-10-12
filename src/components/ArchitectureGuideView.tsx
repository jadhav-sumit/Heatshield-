import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Layers, 
  Workflow, 
  CheckCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Shield, 
  Terminal, 
  Cpu, 
  Database,
  ArrowRight
} from 'lucide-react';

export const ArchitectureGuideView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pipelineStages = [
    { title: '1. Weather & Location', desc: 'Open-Meteo API / Browser Geolocation / Manual Inputs' },
    { title: '2. Data Processing', desc: 'Bounds checking, humidity curves & UHI microclimate normalization' },
    { title: '3. Heat-Risk Prediction', desc: 'Mathematical heat-risk index engine (0-100 scale)' },
    { title: '4. Risk Classification', desc: 'Low (0-44), Moderate (45-74), High (75-100)' },
    { title: '5. Map & AI Assistant', desc: 'Leaflet spatial markers & Gemini 3.8 Flash grounded chat' },
    { title: '6. Smart Duty Planner', desc: 'Shift rotation, shaded rest intervals & hydration quotas' },
    { title: '7. Alerts & Dispatch', desc: 'Cooling priority audits & civic ward notifications' },
    { title: '8. End Users', desc: 'Traffic police marshals, outdoor workers, and civic authorities' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              System Architecture & Hackathon Documentation
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Indradhanu 2026 Guide
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Complete technical blueprint, pipeline specification, and implementation instructions for judges and developers.
          </p>
        </div>
      </div>

      {/* End-to-End System Pipeline Diagram */}
      <div className="bg-[#123624] text-white p-6 rounded-2xl border border-[#23583C] shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            End-to-End Data Flow Pipeline
          </h2>
        </div>
        <p className="text-xs text-emerald-200/90 leading-relaxed max-w-3xl">
          Weather Data and Location &rarr; Data Processing &rarr; Heat-Risk Prediction &rarr; Risk Classification &rarr; Interactive Risk Map and AI Safety Assistant &rarr; Smart Duty Planner &rarr; Alerts and Recommendations &rarr; Citizens and Authorities.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {pipelineStages.map((stg, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs font-bold text-emerald-300 block">{stg.title}</span>
              <p className="text-[11px] text-emerald-100/80 leading-snug">{stg.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purpose and Problem Statement */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Problem Statement & Climate Impact</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Extreme heatwaves across India and global cities cause severe occupational heat stress, dehydration, heat exhaustion, and heat strokes among traffic police and outdoor municipal staff. Asphalt surfaces trap solar radiation, creating localized microclimates up to 5°C hotter than reported ambient weather. HeatShield AI bridges this gap with microclimate-aware scoring and actionable duty rosters.
          </p>
          <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 text-[11px] text-stone-500">
            <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium">Theme: AI for Climate Change</span>
            <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium">Indradhanu 2026</span>
          </div>
        </div>

        {/* Frontend & Backend Architecture */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Full-Stack Architecture</span>
          </div>
          <ul className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
            <li>• <strong>Frontend:</strong> React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Leaflet GIS mapping.</li>
            <li>• <strong>Server Runtime:</strong> Node.js + Express backend running in <code>server.ts</code> with server-side proxy routes.</li>
            <li>• <strong>AI Engine:</strong> <code>@google/genai</code> SDK using <code>gemini-3.8-flash</code> with grounded context and automatic rule-based fallback.</li>
            <li>• <strong>Geocoding & Weather:</strong> Open-Meteo keyless API + BigDataCloud reverse geocoding + local offline simulator.</li>
          </ul>
        </div>
      </div>

      {/* Environment Variables & Running the App */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-900">
            <Terminal className="w-4 h-4 text-emerald-700" />
            <span>Environment Variables & Configuration</span>
          </div>
          <button
            onClick={() => copyToClipboard('GEMINI_API_KEY=""\nAPP_URL=""\nPORT=3000\nNUGEN_API_KEY=""', 'env')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            {copiedKey === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'env' ? 'Copied' : 'Copy .env snippet'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Variable</th>
                <th className="p-3">Required</th>
                <th className="p-3">Description</th>
                <th className="p-3">Fallback Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              <tr>
                <td className="p-3 font-mono font-bold text-emerald-800">GEMINI_API_KEY</td>
                <td className="p-3 text-stone-500">Optional</td>
                <td className="p-3">Enables server-side Gemini 3.8 Flash AI Safety Assistant</td>
                <td className="p-3 text-stone-500">Transparent grounded rule-based demo assistant</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-emerald-800">PORT</td>
                <td className="p-3 text-stone-500">Optional</td>
                <td className="p-3">Server listening port (default: 3000)</td>
                <td className="p-3 text-stone-500">Defaults to 3000</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-emerald-800">NUGEN_API_KEY</td>
                <td className="p-3 text-stone-500">Optional</td>
                <td className="p-3">API key for Indradhanu Nugen IoT telemetry gateway</td>
                <td className="p-3 text-stone-500">Architectural sandbox serializer preview</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Capability Status Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-stone-900">
          Feature Status & Live vs Demo Matrix
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Global Location Selector
            </span>
            <p className="text-emerald-800 text-[11px]">
              Fully functional worldwide with Open-Meteo geocoding and browser GPS permission.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Heat-Risk Recalculator
            </span>
            <p className="text-emerald-800 text-[11px]">
              Instant real-time recalculation of risk scores, categories, and actions upon slider adjustments.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              CSV Report Export
            </span>
            <p className="text-emerald-800 text-[11px]">
              Generates and downloads real CSV report file with all junctions and risk metadata.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Smart Duty Planner
            </span>
            <p className="text-emerald-800 text-[11px]">
              Editable supervisor status, interactive task checklists, and shift hydration quotas.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Interactive Leaflet Map
            </span>
            <p className="text-emerald-800 text-[11px]">
              OpenStreetMap tiles, custom color-coded risk markers, zoom/pan, and popups.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Transparent Disclosures
            </span>
            <p className="text-emerald-800 text-[11px]">
              No hallucinated hospitals or fake live claims. Clear distinction between live and demo modes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
