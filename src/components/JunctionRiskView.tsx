import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  Sliders, 
  Info, 
  Car, 
  Trees, 
  Users, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Junction, RiskCategory, TrafficIntensity } from '../types';
import { calculateHeatRiskScore, getRecommendedAction, getRiskColorClasses } from '../utils/heatRisk';

interface JunctionRiskViewProps {
  junctions: Junction[];
  selectedJunction: Junction | null;
  onSelectJunction: (junction: Junction) => void;
  onUpdateJunction: (updatedJunction: Junction) => void;
  onExportCsv: () => void;
  locationName: string;
}

export const JunctionRiskView: React.FC<JunctionRiskViewProps> = ({
  junctions,
  selectedJunction,
  onSelectJunction,
  onUpdateJunction,
  onExportCsv,
  locationName,
}) => {
  const [filterRisk, setFilterRisk] = useState<'All' | RiskCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active junction being edited/inspected
  const activeJunction = selectedJunction || junctions[0];

  // Simulator state for the active junction
  const [editTemp, setEditTemp] = useState<number>(activeJunction?.temp || 38.0);
  const [editHumidity, setEditHumidity] = useState<number>(activeJunction?.humidity || 50);
  const [editTraffic, setEditTraffic] = useState<TrafficIntensity>(activeJunction?.traffic || 'Heavy');
  const [editShade, setEditShade] = useState<number>(activeJunction?.shadePercent || 20);

  // Sync simulator state when active junction changes
  React.useEffect(() => {
    if (activeJunction) {
      setEditTemp(activeJunction.temp);
      setEditHumidity(activeJunction.humidity);
      setEditTraffic(activeJunction.traffic);
      setEditShade(activeJunction.shadePercent);
    }
  }, [activeJunction?.id]);

  // Recalculate preview immediately
  const liveCalculation = calculateHeatRiskScore(editTemp, editHumidity, editTraffic, editShade);

  const handleApplyRecalculation = () => {
    if (!activeJunction) return;
    const { score, category } = calculateHeatRiskScore(editTemp, editHumidity, editTraffic, editShade);
    const updated: Junction = {
      ...activeJunction,
      temp: editTemp,
      humidity: editHumidity,
      traffic: editTraffic,
      shadePercent: editShade,
      riskScore: score,
      riskCategory: category,
      action: getRecommendedAction(category, editTemp),
      lastUpdated: 'Just now (Recalculated)',
    };
    onUpdateJunction(updated);
  };

  const filteredJunctions = junctions.filter((j) => {
    const matchesFilter = filterRisk === 'All' || j.riskCategory === filterRisk;
    const matchesSearch =
      j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              Heat-Risk Monitoring Register
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {locationName}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time thermal risk scores calculated with microclimate traffic & humidity weights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transparent Formula Disclaimer Card */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-2">
            <span>Transparent Demo Heat-Risk Model & Disclaimer</span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.2 rounded-full font-mono">
              Thresholds: Low (0–44) | Moderate (45–74) | High (75–100)
            </span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            The HeatShield AI demo formula combines ambient temperature (baseline 24°C), relative humidity penalties, asphalt traffic microclimate multipliers, and shade discounts.
            <strong> Note:</strong> This score is an illustrative planning metric for the Indradhanu 2026 hackathon and does not replace official IMD/WHO medical heatwave advisories.
          </p>
        </div>
      </div>

      {/* Main Layout: List & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Junction Cards & Register */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-stone-200">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search junction name or area..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto">
              {(['All', 'High', 'Moderate', 'Low'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterRisk(cat)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
                    filterRisk === cat
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Junctions List */}
          <div className="space-y-3">
            {filteredJunctions.map((j) => {
              const isSelected = activeJunction?.id === j.id;
              const colors = getRiskColorClasses(j.riskCategory);

              return (
                <div
                  key={j.id}
                  onClick={() => onSelectJunction(j)}
                  className={`p-4 rounded-2xl bg-white border transition cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/20'
                      : 'border-stone-200 hover:border-emerald-500/40 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.indicator}`} />
                        <h3 className="font-bold text-sm text-stone-900">{j.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                          {j.riskCategory} Risk
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">{j.neighborhood}</p>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <div className="text-xs text-stone-400 uppercase font-bold text-[10px]">
                          Risk Score
                        </div>
                        <div className={`text-lg font-black font-mono ${colors.text}`}>
                          {j.riskScore}
                          <span className="text-xs text-stone-400 font-normal">/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Microclimate Grid */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-stone-100 text-xs">
                    <div className="p-2 rounded-lg bg-stone-50">
                      <span className="text-[10px] text-stone-500 block">Temperature</span>
                      <span className="font-bold text-stone-800">{j.temp}°C</span>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50">
                      <span className="text-[10px] text-stone-500 block">Relative Humidity</span>
                      <span className="font-bold text-stone-800">{j.humidity}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50">
                      <span className="text-[10px] text-stone-500 block">Traffic Intensity</span>
                      <span className="font-bold text-stone-800">{j.traffic}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50">
                      <span className="text-[10px] text-stone-500 block">Shade Canopy</span>
                      <span className="font-bold text-stone-800">{j.shadePercent}%</span>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div className="mt-3 p-2.5 rounded-xl bg-stone-100/70 text-xs text-stone-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900">Duty Protocol: </span>
                      {j.action}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Interactive Recalculation & Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-stone-900">
                  Microclimate Recalculator
                </h3>
              </div>
              <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                Instant Simulation
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Target Junction
              </span>
              <span className="font-bold text-sm text-stone-900">{activeJunction?.name}</span>
              <p className="text-xs text-stone-500 mt-0.5">
                Adjust sliders to immediately simulate how ambient heatwaves impact this post.
              </p>
            </div>

            {/* Slider 1: Temperature */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                <span>Temperature (°C)</span>
                <span className="font-mono text-stone-900 font-bold text-sm">{editTemp}°C</span>
              </div>
              <input
                type="range"
                min="26"
                max="48"
                step="0.2"
                value={editTemp}
                onChange={(e) => setEditTemp(parseFloat(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5 font-mono">
                <span>26°C (Mild)</span>
                <span>38°C (Peak Summer)</span>
                <span>48°C (Severe Heatwave)</span>
              </div>
            </div>

            {/* Slider 2: Relative Humidity */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                <span>Relative Humidity (%)</span>
                <span className="font-mono text-stone-900 font-bold text-sm">{editHumidity}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="1"
                value={editHumidity}
                onChange={(e) => setEditHumidity(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5 font-mono">
                <span>15% (Arid)</span>
                <span>50% (Sub-tropical)</span>
                <span>90% (Monsoon Wet)</span>
              </div>
            </div>

            {/* Traffic Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Traffic & Bitumen Heat Multiplier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Normal', 'Moderate', 'Heavy', 'Gridlock'] as TrafficIntensity[]).map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setEditTraffic(tr)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                      editTraffic === tr
                        ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {/* Shade Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                <span>Shade & Tree Canopy Mitigation (%)</span>
                <span className="font-mono text-stone-900 font-bold text-sm">{editShade}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={editShade}
                onChange={(e) => setEditShade(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Live Recalculated Score Card */}
            <div className={`p-4 rounded-xl border ${getRiskColorClasses(liveCalculation.category).bg} ${getRiskColorClasses(liveCalculation.category).border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Recalculated Score
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getRiskColorClasses(liveCalculation.category).badge}`}>
                  {liveCalculation.category} Risk
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black font-mono ${getRiskColorClasses(liveCalculation.category).text}`}>
                  {liveCalculation.score}
                </span>
                <span className="text-xs text-stone-500 font-medium">/ 100 Index</span>
              </div>

              <div className="mt-2 text-[11px] text-stone-600 font-mono bg-white/70 p-2 rounded-lg border border-stone-200/60">
                {liveCalculation.formulaBreakdown}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyRecalculation}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#123624] hover:bg-[#1B4D35] text-white shadow-md transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Apply & Update Dashboard Live</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
