import { Asteroid } from '../types';
// IMPORT THE CONFIG VARIABLE HERE
import { API_BASE_URL } from '../config';

// Fallback scoring logic (client-side safety net)
const calculateNumericalScore = (asteroid: any): number => {
    // Basic heuristics if backend score is missing
    const velocity = Number(asteroid.close_approach_data[0]?.relative_velocity_km_s || 0);
    const diameterMin = asteroid.estimated_diameter_km?.min || 0;
    const diameterMax = asteroid.estimated_diameter_km?.max || 0;
    const diameter = (diameterMin + diameterMax) / 2;
    
    // Simple weighting: Velocity contributes + Diameter contributes
    // Capped at 100
    const score = (velocity * 1.5) + (diameter * 10);
    
    return Math.min(Math.round(score), 100);
};

export const getAsteroids = async (): Promise<Asteroid[]> => {
    try {
        // USE THE DYNAMIC URL FROM CONFIG
        const response = await fetch(`${API_BASE_URL}/asteroids`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch asteroid data');
        }
        
        const data = await response.json();
        
        // Return data, ensuring risk_score exists (fallback to client calc if needed)
        return data.map((a: any) => ({
            ...a,
            risk_score: (typeof a.risk_score === 'number') ? a.risk_score : calculateNumericalScore(a)
        }));
    } catch (error) {
        console.error("Error fetching asteroids:", error);
        return [];
    }
};

export const getAsteroidById = async (id: string): Promise<Asteroid | undefined> => {
    try {
        // Since our backend doesn't have a specific ID endpoint yet, 
        // we fetch all and find one (efficiency improvement for later)
        const asteroids = await getAsteroids();
        return asteroids.find(a => a.id === id);
    } catch (error) {
        console.error("Error fetching asteroid details:", error);
        return undefined;
    }
};