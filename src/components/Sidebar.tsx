import React from 'react';
import {
  LayoutDashboard,
  Flame,
  Map,
  CalendarCheck2,
  Droplets,
  BotMessageSquare,
  SlidersHorizontal,
  Cpu,
  BookOpenCheck,
  Shield,
  ExternalLink
} from 'lucide-react';

export type NavTab = 
  | 'overview'
  | 'junctions'
  | 'map'
  | 'duty-planner'
  | 'cooling-priorities'
  | 'ai-assistant'
  | 'weather-inputs'
  | 'nugen-api'
  | 'architecture';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  highRiskCount: number;
  pendingDutyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  highRiskCount,
  pendingDutyCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'junctions' as NavTab,
      label: 'Junction Risk',
      icon: Flame,
      badge: highRiskCount > 0 ? `${highRiskCount} High` : null,
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    },
    {
      id: 'map' as NavTab,
      label: 'Interactive Map',
      icon: Map,
      badge: null,
    },
    {
      id: 'duty-planner' as NavTab,
      label: 'Duty Planner',
      icon: CalendarCheck2,
      badge: pendingDutyCount > 0 ? `${pendingDutyCount} Review` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'cooling-priorities' as NavTab,
      label: 'Cooling Priorities',
      icon: Droplets,
      badge: null,
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'AI Safety Assistant',
      icon: BotMessageSquare,
      badge: 'Gemini',
      badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    },
    {
      id: 'weather-inputs' as NavTab,
      label: 'Weather Inputs',
      icon: SlidersHorizontal,
      badge: null,
    },
    {
      id: 'nugen-api' as NavTab,
      label: 'Nugen API Hub',
      icon: Cpu,
      badge: 'Hackathon',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    },
    {
      id: 'architecture' as NavTab,
      label: 'System Architecture',
      icon: BookOpenCheck,
      badge: null,
    },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-20 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-25 w-64 bg-[#0F281B] text-[#FAF8F5] border-r border-[#1D4430] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-[#1D4430]/80">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold uppercase tracking-wider">
            <span>Navigation Modules</span>
            <span className="text-[10px] text-emerald-400/70 font-mono">v1.2-hackathon</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-100 hover:text-white hover:bg-[#1A3D2A]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition ${
                      isActive ? 'text-white' : 'text-emerald-300 group-hover:text-emerald-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : item.badgeColor || 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Hackathon Badge Card */}
        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-[#163825] to-[#1F4932] border border-emerald-600/30 text-xs text-emerald-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="font-bold text-white text-[13px]">Indradhanu 2026</span>
          </div>
          <p className="text-[11px] text-emerald-200/90 leading-relaxed mb-2">
            Theme: <strong>AI for Climate Change</strong>. Protect outdoor staff and traffic police from extreme heatwaves.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-emerald-700/40 text-[10px] text-emerald-300">
            <span>UN SDG 13 & 3</span>
            <span className="font-mono">Demo Build</span>
          </div>
        </div>
      </aside>
    </>
  );
};
