import { Asteroid, RiskLevel } from '../types';

const API_URL = 'http://localhost:5000';


const calculateNumericalScore = (asteroid: any): number => {
    
    const velocity = Number(asteroid.close_approach_data[0]?.relative_velocity_km_s || 0);
    const diameter = (asteroid.estimated_diameter_km.min + asteroid.estimated_diameter_km.max) / 2;
    
    
    const score = (velocity * 1.5) + (diameter * 10);
    
   
    return Math.min(Math.round(score), 100);
};

export const getAsteroids = async (): Promise<Asteroid[]> => {
    try {
        const response = await fetch(`${API_URL}/asteroids`);
        if (!response.ok) {
            throw new Error('Failed to fetch asteroid data');
        }
        const data = await response.json();
        
        
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
