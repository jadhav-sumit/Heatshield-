import { RiskCategory, TrafficIntensity, Junction } from '../types';

/**
 * Transparent Demo Heat-Risk Formula
 * 
 * Score (0-100) = Baseline Temperature Thermal Stress + Humidity Penalty 
 *                + Traffic / Asphalt Urban Heat Multiplier - Canopy Shade Discount
 * 
 * Thresholds (as specified):
 * Low: 0 - 44
 * Moderate: 45 - 74
 * High: 75 - 100
 */
export function calculateHeatRiskScore(
  temperature: number,
  humidity: number,
  traffic: TrafficIntensity = 'Moderate',
  shadePercent: number = 20
): { score: number; category: RiskCategory; formulaBreakdown: string } {
  // 1. Thermal temperature load (baseline reference 25°C room comfort)
  // Each degree above 25°C adds ~3.2 points
  const tempDiff = Math.max(0, temperature - 24);
  const tempComponent = Math.min(55, tempDiff * 3.3);

  // 2. Relative Humidity penalty (evaporative cooling limitation)
  // High humidity (above 40%) significantly impairs human perspiration
  const humidityExcess = Math.max(0, humidity - 30);
  const humidityComponent = Math.min(30, humidityExcess * 0.45);

  // 3. Traffic & Asphalt microclimate load (vehicle exhaust + dark bitumen reradiation)
  let trafficComponent = 8;
  if (traffic === 'Normal') trafficComponent = 4;
  else if (traffic === 'Moderate') trafficComponent = 8;
  else if (traffic === 'Heavy') trafficComponent = 14;
  else if (traffic === 'Gridlock') trafficComponent = 18;

  // 4. Urban tree canopy & shaded kiosk mitigation discount
  const shadeDiscount = Math.min(15, (shadePercent / 100) * 14);

  // Calculate composite score clamped to 0 - 100
  let rawScore = tempComponent + humidityComponent + trafficComponent - shadeDiscount;
  const score = Math.max(10, Math.min(100, Math.round(rawScore)));

  // Risk categorization
  let category: RiskCategory = 'Low';
  if (score >= 75) {
    category = 'High';
  } else if (score >= 45) {
    category = 'Moderate';
  } else {
    category = 'Low';
  }

  const formulaBreakdown = `Temp Factor (${tempComponent.toFixed(1)}) + Humidity Factor (${humidityComponent.toFixed(1)}) + Traffic Load (${trafficComponent}) - Shade Relief (${shadeDiscount.toFixed(1)}) = ${score}/100`;

  return { score, category, formulaBreakdown };
}

export function getRecommendedAction(category: RiskCategory, temp: number): string {
  if (category === 'High') {
    return 'Mandatory 15-min shaded rest every 45 min; chilled ORS replenishment; rotate staff from exposed tarmac posts; active water misting required.';
  }
  if (category === 'Moderate') {
    return 'Enforce 350ml hydration every 30 min; swap exposed posts during peak 13:00-15:30 window; deploy UV protective neck flaps and caps.';
  }
  return 'Standard duty hydration; maintain baseline water refills; normal staff monitoring and wellbeing check-ins.';
}

export function getRiskColorClasses(category: RiskCategory): {
  badge: string;
  border: string;
  bg: string;
  text: string;
  indicator: string;
} {
  switch (category) {
    case 'High':
      return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        border: 'border-red-300',
        bg: 'bg-red-50/60',
        text: 'text-red-700',
        indicator: 'bg-red-600',
      };
    case 'Moderate':
      return {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        border: 'border-amber-300',
        bg: 'bg-amber-50/60',
        text: 'text-amber-700',
        indicator: 'bg-amber-500',
      };
    case 'Low':
    default:
      return {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        border: 'border-emerald-300',
        bg: 'bg-emerald-50/60',
        text: 'text-emerald-700',
        indicator: 'bg-emerald-600',
      };
  }
}

/**
 * Real CSV report exporter that triggers a browser download
 */
export function exportReportCsv(junctions: Junction[], locationName: string, dataSource: string) {
  const headers = [
    'Junction / Monitoring Location',
    'Neighborhood',
    'Latitude',
    'Longitude',
    'Temperature (°C)',
    'Relative Humidity (%)',
    'Traffic Intensity',
    'Shade Cover (%)',
    'Heat-Risk Score (0-100)',
    'Risk Category',
    'Assigned Outdoor Staff',
    'Recommended Safety Action',
    'Data Source',
    'Report Timestamp',
  ];

  const timestamp = new Date().toISOString();

  const rows = junctions.map((j) => [
    `"${j.name.replace(/"/g, '""')}"`,
    `"${j.neighborhood.replace(/"/g, '""')}"`,
    j.lat,
    j.lon,
    j.temp,
    j.humidity,
    `"${j.traffic}"`,
    `${j.shadePercent}%`,
    j.riskScore,
    `"${j.riskCategory}"`,
    j.vulnerableStaffCount,
    `"${j.action.replace(/"/g, '""')}"`,
    `"${dataSource}"`,
    `"${timestamp}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const sanitizedLocation = locationName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `heatshield_risk_report_${sanitizedLocation}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
