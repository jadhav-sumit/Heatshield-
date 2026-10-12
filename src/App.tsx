/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { LocationModal } from './components/LocationModal';
import { DashboardOverview } from './components/DashboardOverview';
import { JunctionRiskView } from './components/JunctionRiskView';
import { HeatRiskMap } from './components/HeatRiskMap';
import { DutyPlannerView } from './components/DutyPlannerView';
import { CoolingPrioritiesView } from './components/CoolingPrioritiesView';
import { AiAssistantView } from './components/AiAssistantView';
import { WeatherInputsView } from './components/WeatherInputsView';
import { NugenIntegrationView } from './components/NugenIntegrationView';
import { ArchitectureGuideView } from './components/ArchitectureGuideView';

import {
  INITIAL_PUNE_LOCATION,
  INITIAL_PUNE_JUNCTIONS,
  INITIAL_DUTY_PLANS,
  INITIAL_COOLING_PRIORITIES,
  generateLocalizedJunctions,
} from './data/mockData';
import {
  Junction,
  DutyPlan,
  CoolingPriority,
  LocationInfo,
  UserProfile,
  WeatherCondition,
} from './types';
import { exportReportCsv, calculateHeatRiskScore, getRecommendedAction } from './utils/heatRisk';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Authenticated User State (defaults to a demo Traffic Police supervisor)
  const [user, setUser] = useState<UserProfile | null>({
    id: 'demo-user-1',
    fullName: 'Insp. R. Kulkarni',
    email: 'r.kulkarni@traffic.pune.gov.in',
    role: 'Traffic Police',
    badgeNumber: 'TP-PUNE-4102',
    isLoggedIn: true,
  });

  // Current Location State
  const [location, setLocation] = useState<LocationInfo>(INITIAL_PUNE_LOCATION);

  // Weather State
  const [weather, setWeather] = useState<WeatherCondition>({
    temperature: 38.4,
    apparentTemp: 42.8,
    humidity: 48,
    windSpeed: 11,
    uvIndex: 9,
    conditionDescription: 'Sunny with Severe Solar Radiant Load',
    isLive: false,
    source: 'HeatShield Baseline Simulation (Indradhanu 2026)',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Monitored Junctions State (5 Pune locations by default)
  const [junctions, setJunctions] = useState<Junction[]>(INITIAL_PUNE_JUNCTIONS);
  const [selectedJunction, setSelectedJunction] = useState<Junction | null>(INITIAL_PUNE_JUNCTIONS[1]); // Swargate by default

  // Duty Plans & Cooling Priorities
  const [dutyPlans, setDutyPlans] = useState<DutyPlan[]>(INITIAL_DUTY_PLANS);
  const [coolingPriorities, setCoolingPriorities] = useState<CoolingPriority[]>(INITIAL_COOLING_PRIORITIES);

  // Counts for badges
  const highRiskCount = junctions.filter((j) => j.riskCategory === 'High').length;
  const pendingDutyCount = dutyPlans.filter((dp) => dp.supervisorStatus !== 'Approved').length;

  // Handle Location Change
  const handleSelectLocation = async (newLocation: LocationInfo) => {
    setLocation(newLocation);
    setIsRefreshing(true);

    try {
      // Query server for live weather / geocoding lookup
      const res = await fetch(`/api/weather/lookup?lat=${newLocation.lat}&lon=${newLocation.lon}&city=${encodeURIComponent(newLocation.city)}`);
      if (res.ok) {
        const data = await res.json();
        const liveTemp = data.temperature || 38.0;
        const liveHumidity = data.humidity || 50;

        setWeather({
          temperature: liveTemp,
          apparentTemp: data.apparentTemperature || Math.round((liveTemp + liveHumidity * 0.1) * 10) / 10,
          humidity: liveHumidity,
          windSpeed: data.windSpeed || 12,
          uvIndex: liveTemp > 38 ? 9 : 7,
          conditionDescription: 'Live Atmospheric Stream',
          isLive: data.isLive ?? true,
          source: data.source || 'Open-Meteo Live API',
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Regenerate localized urban junctions for this specific city
        const localizedJunctions = generateLocalizedJunctions(newLocation, liveTemp, liveHumidity);
        setJunctions(localizedJunctions);
        setSelectedJunction(localizedJunctions[0]);

        // Dynamically rank cooling priorities for the newly selected city
        const newPriorities: CoolingPriority[] = localizedJunctions.map((j, idx) => ({
          id: `cp-${newLocation.city.toLowerCase()}-${idx + 1}`,
          rank: idx + 1,
          junctionName: j.name,
          riskScore: j.riskScore,
          facilityType: idx === 0 ? 'Misting Shade Awning' : idx === 1 ? 'ORS & First-Aid Standby' : idx === 2 ? 'Drinking Water Kiosk' : 'Air-Cooled Transit Shelter',
          urgency: j.riskScore >= 75 ? 'Immediate' : j.riskScore >= 45 ? 'High' : 'Scheduled',
          reason: `Heat-risk score (${j.riskScore}/100) with ${j.traffic.toLowerCase()} traffic and ${j.shadePercent}% shade canopy.`,
          proposedAction: `Inspect municipal water supply and install UV shade canopy at ${j.name}.`,
          targetCompletionDays: idx + 2,
        }));
        setCoolingPriorities(newPriorities);
      }
    } catch (err) {
      console.warn('Failed to fetch live weather on location change, falling back to simulated generation:', err);
      const fallbackJunctions = generateLocalizedJunctions(newLocation, weather.temperature, weather.humidity);
      setJunctions(fallbackJunctions);
      setSelectedJunction(fallbackJunctions[0]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh Conditions
  const handleRefreshConditions = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/weather/lookup?lat=${location.lat}&lon=${location.lon}&city=${encodeURIComponent(location.city)}`);
      if (res.ok) {
        const data = await res.json();
        const updatedTemp = data.temperature || weather.temperature;
        const updatedHumidity = data.humidity || weather.humidity;

        setWeather({
          temperature: updatedTemp,
          apparentTemp: data.apparentTemperature || Math.round((updatedTemp + updatedHumidity * 0.1) * 10) / 10,
          humidity: updatedHumidity,
          windSpeed: data.windSpeed || weather.windSpeed,
          uvIndex: updatedTemp > 38 ? 9 : 7,
          conditionDescription: 'Refreshed Meteorological Stream',
          isLive: data.isLive ?? true,
          source: data.source || 'Open-Meteo Live API',
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Update all junctions with fresh temperature variations
        setJunctions((prev) =>
          prev.map((j, idx) => {
            const tempOffset = (idx - 2) * 0.8;
            const newT = Math.round((updatedTemp + tempOffset) * 10) / 10;
            const newH = Math.max(15, Math.min(95, Math.round(updatedHumidity + (idx % 2 === 0 ? 2 : -2))));
            const { score, category } = calculateHeatRiskScore(newT, newH, j.traffic, j.shadePercent);
            return {
              ...j,
              temp: newT,
              humidity: newH,
              riskScore: score,
              riskCategory: category,
              action: getRecommendedAction(category, newT),
              lastUpdated: 'Just now (Refreshed)',
            };
          })
        );
      }
    } catch (err) {
      console.warn('Refresh conditions failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export CSV Report
  const handleExportCsv = () => {
    exportReportCsv(junctions, location.name, location.source);
  };

  // Update specific junction (from recalculator)
  const handleUpdateJunction = (updated: Junction) => {
    setJunctions((prev) =>
      prev.map((j) => (j.id === updated.id ? updated : j))
    );
    if (selectedJunction?.id === updated.id) {
      setSelectedJunction(updated);
    }
  };

  // Update specific duty plan
  const handleUpdateDutyPlan = (updated: DutyPlan) => {
    setDutyPlans((prev) =>
      prev.map((dp) => (dp.id === updated.id ? updated : dp))
    );
  };

  // Update weather manually from simulator
  const handleUpdateWeatherManual = (newWeather: WeatherCondition) => {
    setWeather(newWeather);
    // Recalculate junctions based on new baseline
    setJunctions((prev) =>
      prev.map((j, idx) => {
        const offset = (idx - 2) * 0.7;
        const newT = Math.round((newWeather.temperature + offset) * 10) / 10;
        const newH = newWeather.humidity;
        const { score, category } = calculateHeatRiskScore(newT, newH, j.traffic, j.shadePercent);
        return {
          ...j,
          temp: newT,
          humidity: newH,
          riskScore: score,
          riskCategory: category,
          action: getRecommendedAction(category, newT),
          lastUpdated: 'Just now (Manual Injection)',
        };
      })
    );
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        location={location}
        user={user}
        onOpenLocationModal={() => setLocationModalOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
        onRefreshConditions={handleRefreshConditions}
        onExportCsv={handleExportCsv}
        isRefreshing={isRefreshing}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeTab={activeTab}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          highRiskCount={highRiskCount}
          pendingDutyCount={pendingDutyCount}
        />

        {/* Content View Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              location={location}
              weather={weather}
              junctions={junctions}
              dutyPlans={dutyPlans}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefreshConditions={handleRefreshConditions}
              onExportCsv={handleExportCsv}
              isRefreshing={isRefreshing}
              onSelectJunction={(j) => setSelectedJunction(j)}
            />
          )}

          {activeTab === 'junctions' && (
            <JunctionRiskView
              junctions={junctions}
              selectedJunction={selectedJunction}
              onSelectJunction={(j) => setSelectedJunction(j)}
              onUpdateJunction={handleUpdateJunction}
              onExportCsv={handleExportCsv}
              locationName={location.city || location.name}
            />
          )}

          {activeTab === 'map' && (
            <HeatRiskMap
              location={location}
              junctions={junctions}
              selectedJunction={selectedJunction}
              onSelectJunction={(j) => setSelectedJunction(j)}
            />
          )}

          {activeTab === 'duty-planner' && (
            <DutyPlannerView
              dutyPlans={dutyPlans}
              onUpdateDutyPlan={handleUpdateDutyPlan}
              locationName={location.city || location.name}
            />
          )}

          {activeTab === 'cooling-priorities' && (
            <CoolingPrioritiesView
              priorities={coolingPriorities}
              junctions={junctions}
              locationName={location.city || location.name}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AiAssistantView
              location={location}
              junctions={junctions}
              weather={weather}
              selectedJunction={selectedJunction}
            />
          )}

          {activeTab === 'weather-inputs' && (
            <WeatherInputsView
              location={location}
              weather={weather}
              onUpdateWeather={handleUpdateWeatherManual}
              onRefreshLiveWeather={handleRefreshConditions}
              isRefreshing={isRefreshing}
            />
          )}

          {activeTab === 'nugen-api' && (
            <NugenIntegrationView
              location={location}
              junctions={junctions}
            />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureGuideView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={(u) => setUser(u)}
      />

      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}
