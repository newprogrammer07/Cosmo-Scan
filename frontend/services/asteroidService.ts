import { Asteroid, RiskLevel } from '../types';

const API_URL = 'http://localhost:5000';

// --- NEW INTERNAL HELPER FOR MATH ---
const calculateNumericalScore = (asteroid: any): number => {
    // Basic logic: Higher velocity and larger diameter = higher risk score
    const velocity = Number(asteroid.close_approach_data[0]?.relative_velocity_km_s || 0);
    const diameter = (asteroid.estimated_diameter_km.min + asteroid.estimated_diameter_km.max) / 2;
    
    // Weighted formula (example: 70% velocity, 30% diameter impact)
    const score = (velocity * 1.5) + (diameter * 10);
    
    // Ensure the score stays within a clean 0-100 range for the UI
    return Math.min(Math.round(score), 100);
};

export const getAsteroids = async (): Promise<Asteroid[]> => {
    try {
        const response = await fetch(`${API_URL}/asteroids`);
        if (!response.ok) {
            throw new Error('Failed to fetch asteroid data');
        }
        const data = await response.json();
        
        // --- THE FIX: Map the data to include the calculated score ---
        return data.map((a: any) => ({
            ...a,
            risk_score: a.risk_score || calculateNumericalScore(a)
        }));
    } catch (error) {
        console.error("Error fetching asteroids:", error);
        return [];
    }
};

export const getAsteroidById = async (id: string): Promise<Asteroid | undefined> => {
    try {
        const asteroids = await getAsteroids();
        return asteroids.find(a => a.id === id);
    } catch (error) {
        console.error("Error fetching asteroid details:", error);
        return undefined;
    }
};