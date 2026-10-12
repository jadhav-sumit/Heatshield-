import { Junction, DutyPlan, CoolingPriority, LocationInfo } from '../types';
import { calculateHeatRiskScore, getRecommendedAction } from '../utils/heatRisk';

export const INITIAL_PUNE_LOCATION: LocationInfo = {
  name: 'Pune, Maharashtra, India',
  city: 'Pune',
  state: 'Maharashtra',
  country: 'India',
  lat: 18.5204,
  lon: 73.8567,
  isLive: false,
  source: 'HeatShield Baseline Simulation (Indradhanu 2026)',
  lastRefreshed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const INITIAL_PUNE_JUNCTIONS: Junction[] = [
  {
    id: 'pune-j1',
    name: 'Shivaji Nagar Signal',
    neighborhood: 'Shivaji Nagar / FC Road Hub',
    lat: 18.5314,
    lon: 73.8446,
    temp: 38.2,
    humidity: 46,
    traffic: 'Heavy',
    shadePercent: 18,
    riskScore: 68,
    riskCategory: 'Moderate',
    action: 'Rotate traffic marshals every 60 min; deploy shaded transit umbrellas and 500ml cold water supplies.',
    vulnerableStaffCount: 8,
    drinkingWaterNearby: true,
    lastUpdated: '10 mins ago',
  },
  {
    id: 'pune-j2',
    name: 'Swargate Junction',
    neighborhood: 'Swargate Bus Terminal & Metro Hub',
    lat: 18.5018,
    lon: 73.8586,
    temp: 40.8,
    humidity: 52,
    traffic: 'Gridlock',
    shadePercent: 8,
    riskScore: 84,
    riskCategory: 'High',
    action: 'URGENT: High asphalt heat load. Enforce mandatory 15-min shaded rest every 45 min; continuous misting fans; on-site ORS fluid replenishment.',
    vulnerableStaffCount: 14,
    drinkingWaterNearby: false,
    lastUpdated: '5 mins ago',
  },
  {
    id: 'pune-j3',
    name: 'University Circle',
    neighborhood: 'SPPU University Road',
    lat: 18.5529,
    lon: 73.8261,
    temp: 36.4,
    humidity: 40,
    traffic: 'Moderate',
    shadePercent: 38,
    riskScore: 48,
    riskCategory: 'Moderate',
    action: 'Standard afternoon protocol: UV caps with neck shades; maintain hydration checks every 30 minutes.',
    vulnerableStaffCount: 6,
    drinkingWaterNearby: true,
    lastUpdated: '12 mins ago',
  },
  {
    id: 'pune-j4',
    name: 'Kothrud Depot Signal',
    neighborhood: 'Paud Road Corridor',
    lat: 18.5074,
    lon: 73.8077,
    temp: 37.1,
    humidity: 44,
    traffic: 'Moderate',
    shadePercent: 24,
    riskScore: 54,
    riskCategory: 'Moderate',
    action: 'Verify drinking water dispensary; swap unshaded traffic island post at 14:00; monitor fatigue indicators.',
    vulnerableStaffCount: 7,
    drinkingWaterNearby: true,
    lastUpdated: '8 mins ago',
  },
  {
    id: 'pune-j5',
    name: 'Hadapsar Gadital',
    neighborhood: 'Solapur Road Industrial Gateway',
    lat: 18.5029,
    lon: 73.9272,
    temp: 41.5,
    humidity: 48,
    traffic: 'Heavy',
    shadePercent: 10,
    riskScore: 88,
    riskCategory: 'High',
    action: 'HIGH THERMAL ALERT: Relieve unshaded duty officers; provide active misting canopy and electrolyte electrolytes; check pulse rate.',
    vulnerableStaffCount: 12,
    drinkingWaterNearby: false,
    lastUpdated: '3 mins ago',
  },
];

export const INITIAL_DUTY_PLANS: DutyPlan[] = [
  {
    id: 'dp-1',
    junctionId: 'pune-j2',
    junctionName: 'Swargate Junction (High Risk)',
    shiftName: 'Midday Peak Heat Exposure Shift',
    shiftHours: '11:30 - 15:30',
    riskCategory: 'High',
    personnelCount: 6,
    hydrationTargetMlPerHour: 600,
    restBreakIntervalMin: 45,
    rotationHours: 1.5,
    supervisorStatus: 'Action Required',
    supervisorNotes: 'High solar exposure on flyover ramp. Require extra relief officer from Swargate Division to allow 15m rest cycles.',
    recommendations: [
      'Prohibit solo officer standing on exposed tarmac island without overhead canopy.',
      'Provide chilled electrolytes (ORS sachets) at the traffic control booth.',
      'Mandatory wellness check-in at 13:00 and 14:30.',
    ],
    tasks: [
      { id: 't-1', text: 'Distribute insulated 2-liter hydration flasks with ORS', completed: true, category: 'hydration' },
      { id: 't-2', text: 'Confirm shaded cooling awning erected at southern signal island', completed: false, category: 'ppe' },
      { id: 't-3', text: 'Schedule 45-minute alternating rotation with relief marshal', completed: false, category: 'rotation' },
      { id: 't-4', text: 'Verify nearest primary health center emergency standby contacts', completed: true, category: 'checkin' },
    ],
  },
  {
    id: 'dp-2',
    junctionId: 'pune-j5',
    junctionName: 'Hadapsar Gadital (High Risk)',
    shiftName: 'Afternoon Heavy Freight Duty',
    shiftHours: '13:00 - 17:00',
    riskCategory: 'High',
    personnelCount: 5,
    hydrationTargetMlPerHour: 550,
    restBreakIntervalMin: 50,
    rotationHours: 1.5,
    supervisorStatus: 'Pending Review',
    supervisorNotes: 'Heavy diesel exhaust increases perceived heat index by +3°C. Ensure cooling neck wraps are issued.',
    recommendations: [
      'Position officers under metro flyover shadow whenever traffic permits safe signaling.',
      'Designate cool water refill station at Gadital Bus Depot canteen.',
    ],
    tasks: [
      { id: 't-5', text: 'Inspect chilled water dispenser functionality at depot gate', completed: true, category: 'hydration' },
      { id: 't-6', text: 'Issue UV-blocking neck wraps and polaroid glare shields', completed: false, category: 'ppe' },
      { id: 't-7', text: 'Conduct 14:00 heat stress symptom screening', completed: false, category: 'checkin' },
    ],
  },
  {
    id: 'dp-3',
    junctionId: 'pune-j1',
    junctionName: 'Shivaji Nagar Signal',
    shiftName: 'Morning Peak Transit Roster',
    shiftHours: '08:00 - 12:00',
    riskCategory: 'Moderate',
    personnelCount: 4,
    hydrationTargetMlPerHour: 400,
    restBreakIntervalMin: 60,
    rotationHours: 2.0,
    supervisorStatus: 'Approved',
    supervisorNotes: 'Morning conditions within acceptable threshold. Shifts will transition to shaded posts at 11:00.',
    recommendations: [
      'Standard hydration protocol of 400ml/hr.',
      'Provide sun hats with wide brims before 10:00.',
    ],
    tasks: [
      { id: 't-8', text: 'Morning hydration check and water bottle refill', completed: true, category: 'hydration' },
      { id: 't-9', text: 'Confirm relief officer availability for midday handover', completed: true, category: 'rotation' },
    ],
  },
  {
    id: 'dp-4',
    junctionId: 'pune-j3',
    junctionName: 'University Circle',
    shiftName: 'Late Afternoon Flow Management',
    shiftHours: '15:30 - 19:30',
    riskCategory: 'Moderate',
    personnelCount: 4,
    hydrationTargetMlPerHour: 350,
    restBreakIntervalMin: 60,
    rotationHours: 2.0,
    supervisorStatus: 'Approved',
    supervisorNotes: 'Tree canopy along University road provides natural thermal buffer. Regular hydration sufficient.',
    recommendations: [
      'Monitor evening rush-hour thermal accumulation from vehicular idling.',
    ],
    tasks: [
      { id: 't-10', text: 'Water canister restock at university police chowki', completed: true, category: 'hydration' },
      { id: 't-11', text: 'Check LED warning boards for heat-wave notices', completed: false, category: 'checkin' },
    ],
  },
];

export const INITIAL_COOLING_PRIORITIES: CoolingPriority[] = [
  {
    id: 'cp-1',
    rank: 1,
    junctionName: 'Swargate Multimodal Hub',
    riskScore: 84,
    facilityType: 'Misting Shade Awning',
    urgency: 'Immediate',
    reason: 'Extreme asphalt surface heat (40.8°C), zero natural canopy, and high pedestrian/traffic worker density (>150 staff/day).',
    proposedAction: 'Install solar-assisted water misting canopy and 24/7 cold drinking water ATM at intersection nexus.',
    targetCompletionDays: 2,
  },
  {
    id: 'cp-2',
    rank: 2,
    junctionName: 'Hadapsar Gadital Industrial Crossing',
    riskScore: 88,
    facilityType: 'ORS & First-Aid Standby',
    urgency: 'Immediate',
    reason: 'Peak temperature (41.5°C) exacerbated by heavy logistics trucks and unshaded asphalt expanse.',
    proposedAction: 'Establish dedicated medical first-aid cooling cot with electrolyte replenishment and paramedic standby.',
    targetCompletionDays: 3,
  },
  {
    id: 'cp-3',
    rank: 3,
    junctionName: 'Shivaji Nagar Signal & Metro Gate',
    riskScore: 68,
    facilityType: 'Drinking Water Kiosk',
    urgency: 'High',
    reason: 'Heavy commuter pedestrian volume and traffic police exposure during midday university transit.',
    proposedAction: 'Inspect municipal water fountain filtration and add UV-reflective shade canopy above traffic island.',
    targetCompletionDays: 5,
  },
  {
    id: 'cp-4',
    rank: 4,
    junctionName: 'Kothrud Depot Signal (Paud Road)',
    riskScore: 54,
    facilityType: 'Air-Cooled Transit Shelter',
    urgency: 'High',
    reason: 'Bus depot entrance causes vehicular heat trapping; outdoor conductors and marshals exposed.',
    proposedAction: 'Upgrade bus depot perimeter shelter with passive cooling green roof and evaporative cooling fan.',
    targetCompletionDays: 7,
  },
  {
    id: 'cp-5',
    rank: 5,
    junctionName: 'University Circle (SPPU Gate)',
    riskScore: 48,
    facilityType: 'Digital Heat-Warning Signage',
    urgency: 'Scheduled',
    reason: 'Moderate risk but high student cyclist and runner transit requiring early heat alerts.',
    proposedAction: 'Deploy solar-powered dynamic variable message sign displaying live heat index and hydration warnings.',
    targetCompletionDays: 10,
  },
];

export const GLOBAL_PRESET_CITIES = [
  { name: 'Pune, Maharashtra, India', city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567, baseTemp: 39.2, baseHumidity: 48 },
  { name: 'Mumbai, Maharashtra, India', city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777, baseTemp: 35.8, baseHumidity: 76 },
  { name: 'New Delhi, Delhi, India', city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090, baseTemp: 42.6, baseHumidity: 38 },
  { name: 'Phoenix, Arizona, USA', city: 'Phoenix', state: 'Arizona', country: 'United States', lat: 33.4484, lon: -112.0740, baseTemp: 44.1, baseHumidity: 18 },
  { name: 'Dubai, UAE', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, baseTemp: 43.5, baseHumidity: 52 },
  { name: 'Bangkok, Thailand', city: 'Bangkok', state: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, baseTemp: 37.8, baseHumidity: 72 },
  { name: 'Cairo, Egypt', city: 'Cairo', state: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, baseTemp: 41.0, baseHumidity: 32 },
  { name: 'Madrid, Spain', city: 'Madrid', state: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, baseTemp: 38.0, baseHumidity: 26 },
  { name: 'Singapore', city: 'Singapore', state: 'Central', country: 'Singapore', lat: 1.3521, lon: 103.8198, baseTemp: 33.5, baseHumidity: 84 },
  { name: 'London, England, UK', city: 'London', state: 'Greater London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, baseTemp: 28.5, baseHumidity: 55 },
];

/**
 * Generate 5 realistic monitoring zones for ANY chosen location worldwide
 * ensuring the application never pretends Pune locations exist in London or Phoenix!
 */
export function generateLocalizedJunctions(
  location: LocationInfo,
  currentTemp: number = 38.0,
  currentHumidity: number = 50
): Junction[] {
  const city = location.city || location.name.split(',')[0].trim();
  const baseLat = location.lat;
  const baseLon = location.lon;

  // Offsets for 5 distinct urban hubs around the city center (~2 to 5 km radius)
  const zoneOffsets = [
    { nameSuffix: 'Central Station Terminal', offsetLat: 0.012, offsetLon: 0.008, traffic: 'Heavy' as const, shade: 15, tempAdj: 0.6, humAdj: 2 },
    { nameSuffix: 'Commercial District Crossing', offsetLat: -0.015, offsetLon: 0.014, traffic: 'Gridlock' as const, shade: 8, tempAdj: 1.8, humAdj: 4 },
    { nameSuffix: 'Boulevard & University Ring', offsetLat: 0.022, offsetLon: -0.018, traffic: 'Moderate' as const, shade: 35, tempAdj: -1.2, humAdj: -2 },
    { nameSuffix: 'West Transit Depot & Market', offsetLat: -0.008, offsetLon: -0.024, traffic: 'Heavy' as const, shade: 20, tempAdj: 0.2, humAdj: 1 },
    { nameSuffix: 'Highway Bypass Interchange', offsetLat: -0.028, offsetLon: 0.032, traffic: 'Heavy' as const, shade: 10, tempAdj: 2.2, humAdj: -1 },
  ];

  return zoneOffsets.map((zone, idx) => {
    const temp = Math.round((currentTemp + zone.tempAdj) * 10) / 10;
    const humidity = Math.max(15, Math.min(95, Math.round(currentHumidity + zone.humAdj)));
    const { score, category } = calculateHeatRiskScore(temp, humidity, zone.traffic, zone.shade);
    const action = getRecommendedAction(category, temp);

    return {
      id: `${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}-j${idx + 1}`,
      name: `${city} ${zone.nameSuffix}`,
      neighborhood: `${city} Sector ${idx + 1}`,
      lat: Math.round((baseLat + zone.offsetLat) * 10000) / 10000,
      lon: Math.round((baseLon + zone.offsetLon) * 10000) / 10000,
      temp,
      humidity,
      traffic: zone.traffic,
      shadePercent: zone.shade,
      riskScore: score,
      riskCategory: category,
      action,
      vulnerableStaffCount: 5 + (idx * 2),
      drinkingWaterNearby: idx % 2 === 0,
      lastUpdated: 'Live updated',
    };
  });
}
