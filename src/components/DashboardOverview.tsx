import React from 'react';
import { 
  Flame, 
  MapPin, 
  Thermometer, 
  Clock, 
  ShieldAlert, 
  CalendarCheck2, 
  RefreshCw, 
  Download, 
  ArrowRight,
  TrendingUp,
  Droplets,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Junction, DutyPlan, LocationInfo, WeatherCondition } from '../types';
import { getRiskColorClasses } from '../utils/heatRisk';
import { NavTab } from './Sidebar';

interface DashboardOverviewProps {
  location: LocationInfo;
  weather: WeatherCondition;
  junctions: Junction[];
  dutyPlans: DutyPlan[];
  onNavigateTab: (tab: NavTab) => void;
  onRefreshConditions: () => void;
  onExportCsv: () => void;
  isRefreshing: boolean;
  onSelectJunction: (junction: Junction) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  location,
  weather,
  junctions,
  dutyPlans,
  onNavigateTab,
  onRefreshConditions,
  onExportCsv,
  isRefreshing,
  onSelectJunction,
}) => {
  const highRiskJunctions = junctions.filter((j) => j.riskCategory === 'High');
  const moderateRiskJunctions = junctions.filter((j) => j.riskCategory === 'Moderate');
  const peakTemp = Math.max(...junctions.map((j) => j.temp), weather.temperature);
  const pendingDutyPlans = dutyPlans.filter((dp) => dp.supervisorStatus !== 'Approved');

  // Highest risk junction for instant alert
  const topCriticalJunction = [...junctions].sort((a, b) => b.riskScore - a.riskScore)[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Ribbon */}
      <div className="bg-gradient-to-r from-[#123624] via-[#1B4D36] to-[#123624] text-white p-6 rounded-2xl shadow-lg border border-[#23583C] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Heat-Risk Command Center
              </span>
              <span className="text-xs text-emerald-200/80 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Updated {location.lastRefreshed}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{location.city || location.name}</span>
              <span className="text-sm font-normal text-emerald-300">({location.country})</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
              Real-time heat vulnerability index for outdoor traffic police, municipal personnel, and transit workers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onRefreshConditions}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-[#1E4E36] hover:bg-[#256042] border border-emerald-500/40 text-xs font-semibold text-white flex items-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-300' : ''}`} />
              <span>Refresh Conditions</span>
            </button>

            <button
              onClick={onExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Data Source Notice Bar */}
        <div className="mt-4 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between text-xs text-emerald-200/90 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Data Mode:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${location.isLive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${location.isLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {location.source}
            </span>
            {!location.isLive && (
              <span className="text-[11px] text-amber-200/90 italic">
                (Baseline demonstration metrics calibrated for Pune microclimate)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Ambient: <strong>{weather.temperature}°C</strong></span>
            <span>Humidity: <strong>{weather.humidity}%</strong></span>
            <span>Apparent: <strong>{weather.apparentTemp}°C</strong></span>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar if High-Risk Junctions Exist */}
      {highRiskJunctions.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-900 uppercase tracking-wider">
                  Critical Heat-Stress Alert
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-200 text-red-900">
                  {highRiskJunctions.length} High-Risk Junctions
                </span>
              </div>
              <p className="text-xs text-red-800 mt-0.5">
                <strong>{topCriticalJunction?.name}</strong> records peak heat-risk score ({topCriticalJunction?.riskScore}/100). Enforce mandatory 15-minute shaded rotation and provide chilled electrolytes.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('junctions')}
            className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1 underline decoration-red-400 whitespace-nowrap self-end sm:self-center"
          >
            Review Risk Register <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Summary Cards (as specified) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Junctions Monitored */}
        <div 
          onClick={() => onNavigateTab('junctions')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-emerald-600/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              1. Junctions Monitored
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 group-hover:scale-110 transition">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{junctions.length}</span>
            <span className="text-xs font-medium text-stone-500">Urban Sectors</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span>{moderateRiskJunctions.length} Moderate</span>
            <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: High-Risk Locations */}
        <div 
          onClick={() => onNavigateTab('junctions')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-red-500/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              2. High-Risk Locations
            </span>
            <div className="p-2 rounded-xl bg-red-100 text-red-800 group-hover:scale-110 transition">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{highRiskJunctions.length}</span>
            <span className="text-xs font-medium text-stone-500">Score &ge; 75/100</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span className="text-red-700 font-medium">Action Mandated</span>
            <span className="text-red-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Inspect <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Current or Peak Temperature */}
        <div 
          onClick={() => onNavigateTab('weather-inputs')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-amber-500/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              3. Peak Monitored Temp
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 group-hover:scale-110 transition">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{peakTemp.toFixed(1)}°C</span>
            <span className="text-xs font-medium text-amber-600">
              Feels {weather.apparentTemp}°C
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span>Humidity: {weather.humidity}%</span>
            <span className="text-amber-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Simulate <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Duty Plans Requiring Review */}
        <div 
          onClick={() => onNavigateTab('duty-planner')}
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-emerald-600/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              4. Duty Plans For Review
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 group-hover:scale-110 transition">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{pendingDutyPlans.length}</span>
            <span className="text-xs font-medium text-amber-600">Pending Review</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span>{dutyPlans.length} Total Rosters</span>
            <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Open Roster <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Junction Quick Monitor + Cooling & AI Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols: Monitored Junctions Quick Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Urban Junction Heat-Risk Register
              </h2>
              <p className="text-xs text-stone-500">
                Click any junction to inspect microclimate indicators and trigger duty relief.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('junctions')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Full Register <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {junctions.map((j) => {
              const colors = getRiskColorClasses(j.riskCategory);
              return (
                <div
                  key={j.id}
                  onClick={() => {
                    onSelectJunction(j);
                    onNavigateTab('junctions');
                  }}
                  className="py-3.5 px-3 rounded-xl hover:bg-stone-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colors.indicator}`} />
                      <span className="font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition">
                        {j.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                        {j.riskCategory} Risk
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {j.action}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end text-xs shrink-0">
                    <div className="text-right">
                      <span className="font-extrabold text-stone-900 block">{j.temp}°C</span>
                      <span className="text-[11px] text-stone-500">{j.humidity}% RH</span>
                    </div>

                    <div className="w-14 text-center p-1.5 rounded-lg bg-stone-100 font-mono font-bold text-stone-800">
                      <span className="text-xs block text-stone-400 font-sans text-[10px]">Score</span>
                      <span className={j.riskScore >= 75 ? 'text-red-700 font-black' : j.riskScore >= 45 ? 'text-amber-700' : 'text-emerald-700'}>
                        {j.riskScore}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-600 transition" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Thresholds: Low (0-44) | Moderate (45-74) | High (75-100)</span>
            <button
              onClick={() => onNavigateTab('map')}
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View on Map &rarr;
            </button>
          </div>
        </div>

        {/* 1 Col: AI Assistant & Cooling Priorities Fast Access */}
        <div className="space-y-6">
          {/* AI Assistant Quick Card */}
          <div className="bg-gradient-to-br from-[#123624] to-[#1E4E36] text-white p-5 rounded-2xl border border-emerald-700/50 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">HeatShield AI Safety Assistant</h3>
                <span className="text-[11px] text-emerald-200">Grounded thermal risk intelligence</span>
              </div>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Ask questions on worker hydration thresholds, highest-risk intersections, and shade planning.
            </p>

            <div className="space-y-1.5">
              <button
                onClick={() => onNavigateTab('ai-assistant')}
                className="w-full text-left text-xs p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition truncate block"
              >
                &bull; "Which junction has the highest heat risk?"
              </button>
              <button
                onClick={() => onNavigateTab('ai-assistant')}
                className="w-full text-left text-xs p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition truncate block"
              >
                &bull; "What safety actions are recommended for high risk?"
              </button>
            </div>

            <button
              onClick={() => onNavigateTab('ai-assistant')}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition text-center shadow-sm block mt-2"
            >
              Launch AI Assistant &rarr;
            </button>
          </div>

          {/* Quick Municipal Cooling Priorities Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900">Cooling Priorities</h3>
              </div>
              <button
                onClick={() => onNavigateTab('cooling-priorities')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View all
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Ranked municipal facility inspections (Drinking water, misting canopies, emergency ORS).
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span>Rank 1: Swargate Terminal</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                  Immediate
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Install solar-assisted water misting canopy and 24/7 cold drinking water ATM.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('cooling-priorities')}
              className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition text-center block"
            >
              Inspect Municipal Checklists &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
