// backend/src/index.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import bcrypt from "bcryptjs";
import { createServer } from "http"; 
import { Server } from "socket.io";
import cron from "node-cron"; 
import axios from "axios";    

const app = express();
const prisma = new PrismaClient();

// 1. Configure CORS
app.use(cors());
app.use(express.json());

// 2. Create the HTTP Server
const httpServer = createServer(app);

// 3. Attach Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Ensure this matches your Frontend URL
    methods: ["GET", "POST"]
  }
});

// ==========================
//    CONFIGURATION
// ==========================

// NOTE: Use your real key here.
const NASA_API_KEY = "WNPkhdFsOd6iXQPXbufix0CCiBZ5IxBdv694hwRh"; 
const NASA_URL = "https://api.nasa.gov/neo/rest/v1/feed";

// --- MOCK DATA FALLBACK (Safety Net) ---
// Used if NASA API fails or rate limits are hit
const MOCK_ASTEROIDS = [
    {
        id: "2023-QW", name: "(2023 QW)", estimated_diameter_km: { min: 0.12, max: 0.28 }, is_potentially_hazardous_asteroid: true,
        close_approach_data: [{ close_approach_date_full: "2026-08-22 14:30", relative_velocity_km_s: "25.4", miss_distance_km: "5700000" }],
        orbital_data: { orbital_period: "365", eccentricity: "0.1", inclination: "5.4" }, risk: "High"
    },
    {
        id: "2021-OR2", name: "(2021 OR2)", estimated_diameter_km: { min: 1.8, max: 4.1 }, is_potentially_hazardous_asteroid: true,
        close_approach_data: [{ close_approach_date_full: "2026-01-15 08:00", relative_velocity_km_s: "19.8", miss_distance_km: "2300000" }],
        orbital_data: { orbital_period: "400", eccentricity: "0.2", inclination: "12.4" }, risk: "Critical"
    },
    {
        id: "2024-TY", name: "(2024 TY)", estimated_diameter_km: { min: 0.05, max: 0.11 }, is_potentially_hazardous_asteroid: false,
        close_approach_data: [{ close_approach_date_full: "2026-09-10 21:00", relative_velocity_km_s: "12.1", miss_distance_km: "45000000" }],
        orbital_data: { orbital_period: "320", eccentricity: "0.05", inclination: "2.1" }, risk: "Low"
    },
    {
        id: "1994-PC1", name: "(1994 PC1)", estimated_diameter_km: { min: 0.8, max: 1.2 }, is_potentially_hazardous_asteroid: true,
        close_approach_data: [{ close_approach_date_full: "2026-03-05 12:45", relative_velocity_km_s: "35.2", miss_distance_km: "11200000" }],
        orbital_data: { orbital_period: "500", eccentricity: "0.3", inclination: "8.5" }, risk: "Moderate"
    }
];

// ==========================
//    NASA REAL-TIME SCHEDULER
// ==========================

// Run every day at 9:00 AM to check for new data
cron.schedule('0 9 * * *', async () => {
  console.log("🛰️ DAILY SCAN: Checking NASA Databases...");

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Fetch Data from NASA
    const response = await axios.get(`${NASA_URL}?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`);
    const nearEarthObjects = response.data.near_earth_objects[today];

    if (!nearEarthObjects) return;

    // 2. Filter for Hazardous Asteroids
    const hazardous = nearEarthObjects.filter((obj: any) => obj.is_potentially_hazardous_asteroid);

    if (hazardous.length > 0) {
      const threat = hazardous[0]; 
      const name = threat.name;
      const velocity = parseFloat(threat.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(0);
      const missDistance = parseFloat(threat.close_approach_data[0].miss_distance.kilometers).toFixed(0);

      console.log(`⚠️ HAZARD DETECTED: ${name}`);

      const alertMessage = {
        title: "NASA ALERT: HAZARDOUS OBJECT",
        message: `Asteroid ${name} approaching Earth. Velocity: ${velocity} km/h. Distance: ${missDistance} km.`,
        timestamp: new Date().toLocaleTimeString(),
        severity: "critical"
      };

      // 3. Broadcast to Frontend (Popup)
      io.emit("system_alert", alertMessage);

      // 4. Save to Database for the first user (Optional / Demo)
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.alert.create({
          data: {
            name: `NASA: ${name} Approach`,
            threshold: 90,
            userId: user.id,
            enabled: true
          }
        });
      }
    } else {
      console.log("✅ No hazardous objects detected by NASA right now.");
    }

  } catch (error) {
    console.error("❌ Failed to fetch NASA data. (Check API Key or Internet)");
  }
});

// ==========================
//      AUTH ROUTES
// ==========================

app.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password" });

    res.json({ 
      user: { id: user.id, name: user.name, email: user.email },
      token: "fake-jwt-token-123" 
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ==========================
//    NASA API ROUTES (ROBUST)
// ==========================

app.get("/asteroids", async (req, res) => {
  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    // Fetch 7 days of data to ensure we always have something to show
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const endDate = nextWeek.toISOString().split('T')[0];

    console.log(`Fetching NASA data from ${startDate} to ${endDate}...`);
    
    const response = await axios.get(`${NASA_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`);
    
    // Check if data structure is valid
    if (!response.data || !response.data.near_earth_objects) {
        throw new Error("Invalid Data Structure from NASA");
    }

    const nearEarthObjects = response.data.near_earth_objects;
    let allAsteroids: any[] = [];

    // Flatten the date-based object into a single array
    Object.keys(nearEarthObjects).forEach(date => {
      allAsteroids = [...allAsteroids, ...nearEarthObjects[date]];
    });

    // Transform to match Frontend Interface
    const formattedAsteroids = allAsteroids.map((obj: any) => {
      let risk = "None";
      const size = obj.estimated_diameter?.meters?.estimated_diameter_max || 0;
      const isHazard = obj.is_potentially_hazardous_asteroid;
      
      // Calculate Risk Level Logic
      if (isHazard) {
        if (size > 200) risk = "Critical";
        else if (size > 100) risk = "High";
        else risk = "Moderate";
      } else {
        const kmDistance = parseFloat(obj.close_approach_data?.[0]?.miss_distance?.kilometers || "0");
        if (kmDistance > 0 && kmDistance < 2000000) risk = "Low"; 
      }

      return {
        id: String(obj.id),
        name: obj.name,
        estimated_diameter_km: {
            min: obj.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
            max: obj.estimated_diameter?.kilometers?.estimated_diameter_max || 0
        },
        is_potentially_hazardous_asteroid: isHazard,
        close_approach_data: [{
          close_approach_date_full: obj.close_approach_data?.[0]?.close_approach_date_full || "Unknown",
          relative_velocity_km_s: parseFloat(obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || "0").toFixed(2),
          miss_distance_km: parseFloat(obj.close_approach_data?.[0]?.miss_distance?.kilometers || "0").toFixed(0)
        }],
        orbital_data: {
            orbital_period: obj.orbital_data?.orbital_period || "N/A",
            eccentricity: obj.orbital_data?.eccentricity || "0",
            inclination: obj.orbital_data?.inclination || "0"
        },
        risk: risk
      };
    });

    console.log(`✅ Success: Found ${formattedAsteroids.length} real asteroids.`);
    res.json(formattedAsteroids);

  } catch (error: any) {
    console.error("⚠️ NASA API Failed:", error.message);
    console.log("🔄 Switching to FALLBACK MODE (Mock Data)");
    
    // RETURN MOCK DATA INSTEAD OF CRASHING
    res.json(MOCK_ASTEROIDS);
  }
});

// ==========================
//    WATCHLIST ROUTES (NEW)
// ==========================

// 1. Add to Watchlist
app.post("/watchlist", async (req, res) => {
  try {
    const { asteroidId, name, risk, date, email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if already in watchlist
    const existing = await prisma.watchlist.findFirst({
      where: { asteroidId, userId: user.id }
    });

    if (existing) return res.status(400).json({ message: "Already in watchlist" });

    const newItem = await prisma.watchlist.create({
      data: {
        asteroidId,
        name,
        risk,
        date,
        userId: user.id
      }
    });

    res.json(newItem);
  } catch (error) {
    console.error("Watchlist Error:", error);
    res.status(500).json({ error: "Failed to save to watchlist" });
  }
});

// 2. Get Watchlist
app.get("/watchlist", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await prisma.user.findUnique({ 
    where: { email: String(email) },
    include: { watchlist: true } 
  });

  if (!user) return res.json([]);
  res.json(user.watchlist);
});

// 3. Remove from Watchlist
app.delete("/watchlist/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.watchlist.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

// ==========================
//      ALERT ROUTES
// ==========================

// 1. Get All Alerts
app.get("/alerts", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await prisma.user.findUnique({ 
    where: { email: String(email) },
    include: { alerts: true } 
  });

  if (!user) return res.json([]); 
  res.json(user.alerts);
});

// 2. Create Alert
app.post("/alerts", async (req, res) => {
  const { name, threshold, email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const newAlert = await prisma.alert.create({
    data: { name, threshold, userId: user.id }
  });
  res.json(newAlert);
});

// 3. Toggle Alert (Enable/Disable)
app.patch("/alerts/:id", async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  const updatedAlert = await prisma.alert.update({
    where: { id: Number(id) },
    data: { enabled }
  });
  res.json(updatedAlert);
});

// 4. Delete Alert
app.delete("/alerts/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.alert.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

// ==========================
//    REAL-TIME SOCKETS (Updated to Save Data)
// ==========================

io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  socket.on("send_message", async (data) => {
    console.log("Message received:", data);

    // 1. SAVE TO DATABASE (This was missing!)
    try {
      await prisma.message.create({
        data: {
          user: data.user,
          text: data.text,
          timestamp: data.timestamp
        }
      });
    } catch (err) {
      console.error("Failed to save message to DB:", err);
    }

    // 2. BROADCAST TO OTHERS
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// --- RISK ANALYSIS ENGINE (SCIENTIFIC FORMULA) ---
const calculateRiskScore = (obj: any) => {
    // 1. EXTRACT & SANITIZE INPUTS
    // Diameter: Try meters first, fallback to km * 1000, default to 0
    let diameter = obj.estimated_diameter?.meters?.estimated_diameter_max;
    if (!diameter && obj.estimated_diameter?.kilometers?.estimated_diameter_max) {
        diameter = obj.estimated_diameter.kilometers.estimated_diameter_max * 1000;
    }
    diameter = diameter || 0;

    const velocity = parseFloat(obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || "0");
    const missDistance = parseFloat(obj.close_approach_data?.[0]?.miss_distance?.kilometers || "999999999");

    // 2. NORMALIZE INPUTS (Map to 0-100)
    // Diameter: Cap at 1000m (1km) -> 100 points
    const normDiameter = Math.min(100, (diameter / 1000) * 100);
    
    // Velocity: Cap at 50 km/s -> 100 points
    const normVelocity = Math.min(100, (velocity / 50) * 100);
    
    // Distance: Lunar Distance (384,400 km) -> 100 points
    const lunarDistance = 384400;
    const effectiveDistance = missDistance > 0 ? missDistance : 1; 
    const normDistance = Math.min(100, (lunarDistance / effectiveDistance) * 100);

    // 3. APPLY FORMULA: (Diameter * 0.4) + (Velocity * 0.3) + (1/Distance * 0.3)
    let totalScore = (normDiameter * 0.4) + (normVelocity * 0.3) + (normDistance * 0.3);

    // 4. CRITICAL OVERRIDE
    if (obj.is_potentially_hazardous_asteroid) {
        totalScore = Math.max(totalScore, 50); 
    }

    return Math.round(totalScore);
};

// ==========================
//    DATA ROUTES (UNIFIED)
// ==========================
app.get("/asteroids", async (req, res) => {
  // Helper to format any asteroid object (Real or Mock)
  const formatAsteroid = (obj: any) => {
      const riskScore = calculateRiskScore(obj); // Uses the Scientific Formula

      let riskLabel = "None";
      if (riskScore >= 75) riskLabel = "Critical";
      else if (riskScore >= 50) riskLabel = "High";
      else if (riskScore >= 25) riskLabel = "Moderate";
      else if (riskScore > 5) riskLabel = "Low";

      return {
        id: String(obj.id),
        name: obj.name,
        estimated_diameter_km: {
            min: obj.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
            max: obj.estimated_diameter?.kilometers?.estimated_diameter_max || 0
        },
        is_potentially_hazardous_asteroid: obj.is_potentially_hazardous_asteroid,
        close_approach_data: [{
          close_approach_date_full: obj.close_approach_data?.[0]?.close_approach_date_full || "Unknown",
          relative_velocity_km_s: parseFloat(obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || "0").toFixed(2),
          miss_distance_km: parseFloat(obj.close_approach_data?.[0]?.miss_distance?.kilometers || "0").toFixed(0)
        }],
        orbital_data: {
            orbital_period: obj.orbital_data?.orbital_period || "N/A",
            eccentricity: obj.orbital_data?.eccentricity || "0",
            inclination: obj.orbital_data?.inclination || "0"
        },
        risk: riskLabel,
        risk_score: riskScore // IMPORTANT: Sends the score to Frontend
      };
  };

  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const endDate = nextWeek.toISOString().split('T')[0];

    console.log(`Fetching NASA data from ${startDate} to ${endDate}...`);
    
    const response = await axios.get(`${NASA_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`);
    
    if (!response.data || !response.data.near_earth_objects) throw new Error("Invalid Data");

    const nearEarthObjects = response.data.near_earth_objects;
    let allAsteroids: any[] = [];
    Object.keys(nearEarthObjects).forEach(date => { allAsteroids = [...allAsteroids, ...nearEarthObjects[date]]; });

    const formattedAsteroids = allAsteroids.map(formatAsteroid);
    console.log(`✅ NASA Data Loaded: ${formattedAsteroids.length} objects`);
    res.json(formattedAsteroids);

  } catch (error) {
    console.log("⚠️ API Error. Switching to FALLBACK MODE (Mock Data)");
    const formattedMock = MOCK_ASTEROIDS.map(formatAsteroid);
    res.json(formattedMock);
  }
});
// ==========================
//    CHAT ROUTES (You are missing this!)
// ==========================

// GET /messages - Load chat history
app.get("/messages", async (req, res) => {
  try {
    // Fetch last 50 messages ordered by time
    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
// ==========================
//      START SERVER
// ==========================

const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});