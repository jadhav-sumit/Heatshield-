import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[HeatShield AI] Gemini AI SDK initialized successfully with server-side API key.');
  } catch (err) {
    console.warn('[HeatShield AI] Failed to initialize GoogleGenAI client:', err);
  }
} else {
  console.log('[HeatShield AI] No GEMINI_API_KEY detected in environment. Running in transparent rule-based demo assistant mode.');
}

// Check AI status
app.get('/api/ai/status', (_req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY && !!ai,
    model: 'gemini-3.8-flash',
    mode: process.env.GEMINI_API_KEY && ai ? 'gemini-live' : 'rule-based-demo',
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint with Gemini or grounded rule-based demo fallback
app.post('/api/ai/chat', async (req, res) => {
  const { message, context, modeOverride } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const useRuleBased = modeOverride === 'rule-based' || !ai || !process.env.GEMINI_API_KEY;

  if (!useRuleBased && ai) {
    try {
      const systemInstruction = `You are the HeatShield AI Safety Assistant, an intelligent heat-risk advisor built for traffic police, municipal authorities, outdoor workers, and citizens under the AI for Climate Change theme (Indradhanu 2026 hackathon).
Current location context: ${JSON.stringify(context?.location || 'Pune, Maharashtra, India')}
Monitored Junctions / Zones: ${JSON.stringify(context?.junctions || [])}
Current Weather Summary: ${JSON.stringify(context?.weather || {})}

GUIDELINES:
1. Explain risk scores (0-100: Low <45, Moderate 45-74, High 75-100) clearly in simple, action-oriented language.
2. Provide practical, cautious occupational and heat-safety guidance (hydration intervals, shaded rest, duty rotation, ORS).
3. Distinguish live weather information from simulated data clearly.
4. Avoid making unsupported medical claims. Always advise calling emergency services (112 or local ambulance) immediately for severe symptoms (confusion, cessation of sweating, loss of consciousness, body temperature >40°C).
5. Ground your recommendations directly in the provided junction data and weather conditions.
6. Format responses with clean bullet points and clear sections where helpful.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || 'No response generated.';
      return res.json({
        reply: responseText,
        source: 'gemini-3.8-flash',
        isAiPowered: true,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[HeatShield AI] Gemini API error:', err);
      // Fall through to honest grounded demo fallback
    }
  }

  // Grounded rule-based fallback response
  const lowerMsg = message.toLowerCase();
  const junctions = context?.junctions || [];
  const locationName = context?.location?.name || 'Pune, Maharashtra, India';

  let reply = '';
  const highestRiskJunction = [...junctions].sort((a: any, b: any) => (b.riskScore || 0) - (a.riskScore || 0))[0];

  if (lowerMsg.includes('highest') || lowerMsg.includes('worst') || lowerMsg.includes('most risk')) {
    if (highestRiskJunction) {
      reply = `According to our current monitoring in **${locationName}**, **${highestRiskJunction.name}** has the highest heat-risk score of **${highestRiskJunction.riskScore}/100** (${highestRiskJunction.riskCategory} Risk).\n\n` +
        `• Current Temp: ${highestRiskJunction.temp}°C | Humidity: ${highestRiskJunction.humidity}%\n` +
        `• Traffic Intensity: ${highestRiskJunction.traffic}\n` +
        `• Recommended Action: ${highestRiskJunction.action}\n\n` +
        `*Supervisor recommendation:* Rotate traffic marshals every 45-60 minutes, enforce mandatory shaded rests, and ensure chilled ORS electrolyte fluids are on site.`;
    } else {
      reply = `Swargate Junction currently records the highest heat-risk score (82/100, High Risk) due to high asphalt radiative heat and peak vehicular congestion.`;
    }
  } else if (lowerMsg.includes('safety action') || lowerMsg.includes('what to do') || lowerMsg.includes('recommend')) {
    reply = `### Standard HeatShield Safety Protocols for Current Conditions:\n\n` +
      `1. **Hydration Schedule**: Drink 250–350ml water/electrolytes every 20–30 minutes, even if not thirsty. Avoid high-caffeine and sugary drinks.\n` +
      `2. **Duty Rotation**: Limit unshaded roadside duty to 90-minute blocks before rotating to a shaded booth or vehicle patrol.\n` +
      `3. **PPE & Gear**: Wear breathable cotton uniforms, wide-brimmed heat hats, UV sunglasses, and wet neck coolers.\n` +
      `4. **Cooling Stations**: Immediate deployment of water misting fans at high-risk signals like Swargate and Hadapsar Gadital.\n` +
      `5. **Emergency Trigger**: If any worker shows dizziness, rapid pulse, or lack of sweating, move to shade immediately and dial emergency services (112).`;
  } else if (lowerMsg.includes('why') && (lowerMsg.includes('high') || lowerMsg.includes('risk') || lowerMsg.includes('score'))) {
    reply = `### How HeatShield AI Calculates Heat-Risk Scores:\n\n` +
      `The demo heat-risk index integrates multiple ambient and urban microclimate indicators:\n` +
      `• **Ambient Wet-Bulb & Dry-Bulb Temperature**: High heat combined with humidity prevents sweat evaporation.\n` +
      `• **Urban Heat Island (UHI) Multiplier**: Dense tarmac/asphalt and concrete surfaces reradiate heat by +3°C to +5°C.\n` +
      `• **Vehicular Heat & Exhaust**: Traffic idling at major intersections traps exhaust heat near ground level.\n` +
      `• **Solar Radiation & Shade Index**: Open junctions without canopy trees experience direct solar load.\n\n` +
      `*Note:* This calculation is transparently demonstrated for hackathon planning and does not replace official meteorological heatwave alerts from IMD or WHO.`;
  } else if (lowerMsg.includes('shade') || lowerMsg.includes('water') || lowerMsg.includes('priority') || lowerMsg.includes('cooling')) {
    reply = `### Municipal Cooling & Facility Prioritization:\n\n` +
      `Based on vulnerability scoring, authorities should prioritize cooling investments at:\n` +
      `1. **Swargate Multimodal Hub**: Highest footfall & traffic; deploy misting shade awnings and free chilled water kiosks.\n` +
      `2. **Hadapsar Gadital**: Industrial junction with high heavy vehicle traffic; install ORS replenishment booth.\n` +
      `3. **Shivaji Nagar Signal**: High pedestrian transit; inspect shaded bus shelters and water dispenser functionality.\n\n` +
      `*Action Item:* Proposed facility inspections should be dispatched to ward health officers before 11:00 AM daily.`;
  } else if (lowerMsg.includes('worker') || lowerMsg.includes('police') || lowerMsg.includes('outdoor')) {
    reply = `### Outdoor Worker & Traffic Police Guidelines:\n\n` +
      `• **Pace Work**: Slow down physical exertion between 12:00 PM and 15:30 PM (peak thermal load).\n` +
      `• **Buddy System**: Traffic personnel and delivery couriers should monitor each other for early heat exhaustion symptoms (heavy sweating, cold clammy skin, nausea).\n` +
      `• **Rest-to-Work Ratios**: In High Risk (>75 score), enforce 15 minutes of shaded rest for every 45 minutes of duty.\n` +
      `• **Cool Down**: Splash water on face, wrists, and neck during mandatory rest breaks.`;
  } else {
    reply = `HeatShield AI is monitoring heat risk for **${locationName}**.\n\n` +
      `• High-risk locations identified: **${highestRiskJunction?.name || 'Swargate Junction'}** (${highestRiskJunction?.riskScore || 82}/100).\n` +
      `• Recommended protocol: Enforce hydration rotations, active shade kiosks, and review duty plans for afternoon shifts.\n\n` +
      `You can ask me questions like:\n` +
      `- "Which junction has the highest heat risk?"\n` +
      `- "What safety actions are recommended for high risk zones?"\n` +
      `- "Why is this junction marked high risk?"\n` +
      `- "Where should authorities prioritize shade and drinking water?"`;
  }

  res.json({
    reply,
    source: 'rule-based-grounded-demo',
    isAiPowered: false,
    notice: 'Rule-based assistant running using local monitoring context. Connect GEMINI_API_KEY in environment to enable full Gemini 3.8 Flash reasoning.',
    timestamp: new Date().toISOString(),
  });
});

// Live Open-Meteo Weather Proxy (Open and keyless, with fallback)
app.get('/api/weather/lookup', async (req, res) => {
  const { lat, lon, city } = req.query;

  try {
    let targetLat = lat ? parseFloat(lat as string) : 18.5204;
    let targetLon = lon ? parseFloat(lon as string) : 73.8567;
    let targetCity = (city as string) || 'Pune, Maharashtra, India';

    // If city provided without lat/lon, geocode via open-meteo geocoding
    if (city && (!lat || !lon)) {
      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city as string)}&count=1&language=en&format=json`;
        const geoResp = await fetch(geoUrl);
        if (geoResp.ok) {
          const geoData = await geoResp.json();
          if (geoData.results && geoData.results.length > 0) {
            targetLat = geoData.results[0].latitude;
            targetLon = geoData.results[0].longitude;
            targetCity = `${geoData.results[0].name}${geoData.results[0].admin1 ? ', ' + geoData.results[0].admin1 : ''}, ${geoData.results[0].country}`;
          }
        }
      } catch (e) {
        console.warn('Geocoding fallback triggered:', e);
      }
    }

    // Fetch live weather from open-meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m&timezone=auto`;
    const weatherResp = await fetch(weatherUrl);

    if (weatherResp.ok) {
      const data = await weatherResp.json();
      const current = data.current;
      return res.json({
        success: true,
        source: 'Open-Meteo Live API',
        isLive: true,
        location: {
          name: targetCity,
          lat: targetLat,
          lon: targetLon,
        },
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        updatedAt: current.time || new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[HeatShield AI] Live weather proxy fetch failed:', err);
  }

  // Graceful fallback to Pune baseline demo data
  res.json({
    success: true,
    source: 'HeatShield Demo Weather Simulation',
    isLive: false,
    location: {
      name: city ? (city as string) : 'Pune, Maharashtra, India',
      lat: 18.5204,
      lon: 73.8567,
    },
    temperature: 38.4,
    apparentTemperature: 43.1,
    humidity: 52,
    windSpeed: 12,
    weatherCode: 1,
    updatedAt: new Date().toISOString(),
    notice: 'External weather network unreachable; displaying simulated baseline data.',
  });
});

// Dedicated Nugen API Hub Endpoints
app.get('/api/nugen/health', (_req, res) => {
  res.json({
    status: 'READY_FOR_INTEGRATION',
    module: 'Nugen API Integration Layer',
    hackathon: 'Indradhanu 2026 — AI for Climate Change',
    purpose: 'Smart heat-risk ingest and municipal dispatch orchestration',
    endpointContracts: {
      heatRiskIngest: '/api/nugen/telemetry/ingest',
      dutyPlanSync: '/api/nugen/duty-planner/sync',
      alertBroadcast: '/api/nugen/alerts/dispatch',
    },
    credentialsConfigured: false,
    integrationMode: 'ARCHITECTURAL_PREVIEW',
    documentationUrl: 'https://github.com/nugen-api/docs (or provided hackathon API portal)',
    notes: 'This mock service matches the verified architectural contract for Nugen API telemetry pipelines. When authenticating, provide NUGEN_API_KEY via backend environment variables.',
  });
});

app.post('/api/nugen/telemetry/simulate', (req, res) => {
  const { junctionId, temperature, humidity } = req.body;
  res.json({
    success: true,
    transmittedToNugen: false,
    mockPayload: {
      junctionId: junctionId || 'PUNE_SWARGATE_01',
      tempCelsius: temperature || 39.2,
      relativeHumidity: humidity || 54,
      deviceTimestamp: new Date().toISOString(),
      simulatedSensorProtocol: 'MQTT-TLS-NUGEN-V2',
    },
    message: 'Nugen telemetry payload serialized successfully in architectural sandbox.',
  });
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[HeatShield AI] Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
