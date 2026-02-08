
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


app.use(cors());
app.use(express.json());


const httpServer = createServer(app);


const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  }
});


const NASA_API_KEY = "WNPkhdFsOd6iXQPXbufix0CCiBZ5IxBdv694hwRh"; 
const NASA_URL = "https://api.nasa.gov/neo/rest/v1/feed";


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


cron.schedule('0 9 * * *', async () => {
  console.log("🛰️ DAILY SCAN: Checking NASA Databases...");

  try {
    const today = new Date().toISOString().split('T')[0];
    
  
    const response = await axios.get(`${NASA_URL}?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`);
    const nearEarthObjects = response.data.near_earth_objects[today];

    if (!nearEarthObjects) return;

    
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

      
      io.emit("system_alert", alertMessage);

      
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



app.get("/asteroids", async (req, res) => {
  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const endDate = nextWeek.toISOString().split('T')[0];

    console.log(`Fetching NASA data from ${startDate} to ${endDate}...`);
    
    const response = await axios.get(`${NASA_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`);
    
    
    if (!response.data || !response.data.near_earth_objects) {
        throw new Error("Invalid Data Structure from NASA");
    }

    const nearEarthObjects = response.data.near_earth_objects;
    let allAsteroids: any[] = [];

    
    Object.keys(nearEarthObjects).forEach(date => {
      allAsteroids = [...allAsteroids, ...nearEarthObjects[date]];
    });

    
    const formattedAsteroids = allAsteroids.map((obj: any) => {
      let risk = "None";
      const size = obj.estimated_diameter?.meters?.estimated_diameter_max || 0;
      const isHazard = obj.is_potentially_hazardous_asteroid;
      
      
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
    
    
    res.json(MOCK_ASTEROIDS);
  }
});


app.post("/watchlist", async (req, res) => {
  try {
    const { asteroidId, name, risk, date, email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    
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


app.delete("/watchlist/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.watchlist.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});


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

app.post("/alerts", async (req, res) => {
  const { name, threshold, email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const newAlert = await prisma.alert.create({
    data: { name, threshold, userId: user.id }
  });
  res.json(newAlert);
});

app.patch("/alerts/:id", async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  const updatedAlert = await prisma.alert.update({
    where: { id: Number(id) },
    data: { enabled }
  });
  res.json(updatedAlert);
});

app.delete("/alerts/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.alert.delete({ where: { id: Number(id) } });
  res.json({ success: true });
});

io.on("connection", (socket) => {
  socket.on("send_message", async (data) => {
    try {
      // 1. Save to Neon Database via Prisma
      const savedMessage = await prisma.message.create({
        data: {
          user: data.user,
          text: data.text,
          timestamp: data.timestamp
        }
      });
      // 2. IMPORTANT: Emit to EVERYONE so the sender sees it too
      io.emit("receive_message", savedMessage); 
    } catch (err) {
      console.error("Database error:", err);
    }
  });
});

const calculateRiskScore = (obj: any) => {
   
    let diameter = obj.estimated_diameter?.meters?.estimated_diameter_max;
    if (!diameter && obj.estimated_diameter?.kilometers?.estimated_diameter_max) {
        diameter = obj.estimated_diameter.kilometers.estimated_diameter_max * 1000;
    }
    diameter = diameter || 0;

    const velocity = parseFloat(obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || "0");
    const missDistance = parseFloat(obj.close_approach_data?.[0]?.miss_distance?.kilometers || "999999999");

   
    const normDiameter = Math.min(100, (diameter / 1000) * 100);
    
    
    const normVelocity = Math.min(100, (velocity / 50) * 100);
    
    
    const lunarDistance = 384400;
    const effectiveDistance = missDistance > 0 ? missDistance : 1; 
    const normDistance = Math.min(100, (lunarDistance / effectiveDistance) * 100);

    
    let totalScore = (normDiameter * 0.4) + (normVelocity * 0.3) + (normDistance * 0.3);

    
    if (obj.is_potentially_hazardous_asteroid) {
        totalScore = Math.max(totalScore, 50); 
    }

    return Math.round(totalScore);
};


app.get("/asteroids", async (req, res) => {
  
  const formatAsteroid = (obj: any) => {
      const riskScore = calculateRiskScore(obj); 

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
        risk_score: riskScore 
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

app.get("/messages", async (req, res) => {
  try {
    
    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
