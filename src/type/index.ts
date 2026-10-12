export type RiskCategory = 'Low' | 'Moderate' | 'High';

export type TrafficIntensity = 'Normal' | 'Moderate' | 'Heavy' | 'Gridlock';

export type UserRole = 'Traffic Police' | 'Citizen' | 'Administrator' | 'Outdoor Worker';

export interface Junction {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lon: number;
  temp: number; // in °C
  humidity: number; // percentage
  traffic: TrafficIntensity;
  shadePercent: number; // 0-100%
  riskScore: number; // 0-100
  riskCategory: RiskCategory;
  action: string;
  vulnerableStaffCount: number;
  drinkingWaterNearby: boolean;
  lastUpdated: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'hydration' | 'rotation' | 'ppe' | 'checkin';
}

export interface DutyPlan {
  id: string;
  junctionId: string;
  junctionName: string;
  shiftName: string;
  shiftHours: string;
  riskCategory: RiskCategory;
  personnelCount: number;
  hydrationTargetMlPerHour: number;
  restBreakIntervalMin: number;
  rotationHours: number;
  supervisorStatus: 'Approved' | 'Pending Review' | 'Action Required';
  supervisorNotes: string;
  recommendations: string[];
  tasks: TaskItem[];
}

export interface CoolingPriority {
  id: string;
  rank: number;
  junctionName: string;
  riskScore: number;
  facilityType: 'Drinking Water Kiosk' | 'Misting Shade Awning' | 'Air-Cooled Transit Shelter' | 'ORS & First-Aid Standby' | 'Digital Heat-Warning Signage';
  urgency: 'Immediate' | 'High' | 'Scheduled';
  reason: string;
  proposedAction: string;
  targetCompletionDays: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  badgeNumber?: string;
  isLoggedIn: boolean;
}

export interface LocationInfo {
  name: string;
  city: string;
  state: string;
  country: string;
  address?: string;
  lat: number;
  lon: number;
  isLive: boolean;
  source: string;
  lastRefreshed: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  isAiPowered?: boolean;
}

export interface WeatherCondition {
  temperature: number;
  humidity: number;
  apparentTemp: number;
  windSpeed: number;
  uvIndex: number;
  conditionDescription: string;
  isLive: boolean;
  source: string;
  lastUpdated: string;
}
