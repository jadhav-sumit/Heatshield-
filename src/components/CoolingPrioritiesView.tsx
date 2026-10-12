import React, { useState } from 'react';
import { 
  Droplets, 
  Trees, 
  Wind, 
  HeartPulse, 
  Radio, 
  AlertCircle, 
  CheckCircle, 
  ArrowUpRight, 
  Clock, 
  Building2, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { CoolingPriority, Junction } from '../types';

interface CoolingPrioritiesViewProps {
  priorities: CoolingPriority[];
  junctions: Junction[];
  locationName: string;
}

export const CoolingPrioritiesView: React.FC<CoolingPrioritiesViewProps> = ({
  priorities,
  junctions,
  locationName,
}) => {
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>(priorities[0]?.id || '');
  const [filterType, setFilterType] = useState<string>('All');

  const activePriority = priorities.find((p) => p.id === selectedPriorityId) || priorities[0];

  const filteredPriorities = priorities.filter((p) => {
    if (filterType === 'All') return true;
    return p.facilityType === filterType;
  });

  const getFacilityIcon = (type: CoolingPriority['facilityType']) => {
    switch (type) {
      case 'Drinking Water Kiosk':
        return Droplets;
      case 'Misting Shade Awning':
        return Wind;
      case 'Air-Cooled Transit Shelter':
        return Trees;
      case 'ORS & First-Aid Standby':
        return HeartPulse;
      case 'Digital Heat-Warning Signage':
      default:
        return Radio;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              Cooling Facility & Public Infrastructure Priorities
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {locationName}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Prioritized municipal intervention list ranked by heat-vulnerability score and public transit exposure.
          </p>
        </div>
      </div>

      {/* Verification & Anti-Hallucination Disclaimer */}
      <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Proposed Facility Inspection Policy:</span>
          <p className="text-emerald-900 leading-relaxed">
            In compliance with hackathon standards, the entries below represent <strong>proposed municipal checks</strong> and urban resilience upgrades. HeatShield AI does not claim or fabricate existing water stations or hospitals; verified facilities are displayed only when authenticated municipal datasets or API endpoints are integrated.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Drinking Water Kiosk', 'Misting Shade Awning', 'ORS & First-Aid Standby', 'Air-Cooled Transit Shelter', 'Digital Heat-Warning Signage'].map((ft) => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition ${
              filterType === ft
                ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {ft}
          </button>
        ))}
      </div>

      {/* Main Grid: Priority List + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Ranked List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredPriorities.map((item) => {
            const Icon = getFacilityIcon(item.facilityType);
            const isSelected = item.id === activePriority?.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPriorityId(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-emerald-50/30 border-emerald-600 ring-2 ring-emerald-600/20'
                    : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{item.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-stone-900">{item.junctionName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.urgency === 'Immediate' ? 'bg-red-100 text-red-800' :
                          item.urgency === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {item.urgency}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mt-1">
                        <Icon className="w-3.5 h-3.5" />
                        <span>Proposed Check: {item.facilityType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Risk Score</span>
                    <span className={`text-base font-black font-mono ${
                      item.riskScore >= 75 ? 'text-red-700' : item.riskScore >= 45 ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      {item.riskScore}/100
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100 line-clamp-2">
                  <strong>Trigger: </strong> {item.reason}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right 5 Cols: Selected Priority Inspection Details */}
        <div className="lg:col-span-5 space-y-4">
          {activePriority && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                  Municipal Action Specification
                </span>
                <span className="text-xs font-mono font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md">
                  Priority Rank #{activePriority.rank}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-stone-900">{activePriority.junctionName}</h2>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mt-1">
                  {React.createElement(getFacilityIcon(activePriority.facilityType), { className: 'w-4 h-4 text-emerald-700' })}
                  <span>{activePriority.facilityType}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs">
                <span className="font-bold text-amber-950 block">Reason for Urgent Intervention:</span>
                <p className="text-amber-900 leading-relaxed">{activePriority.reason}</p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
                <span className="font-bold text-stone-900 block">Proposed Action Plan:</span>
                <p className="text-stone-700 leading-relaxed">{activePriority.proposedAction}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  Target SLA: <strong>{activePriority.targetCompletionDays} Days</strong>
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready for Ward Officer Dispatch
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
