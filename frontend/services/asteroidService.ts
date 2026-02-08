import { Asteroid } from '../types';
import { API_BASE_URL } from '../config';

const calculateNumericalScore = (asteroid: any): number => {
    const velocity = Number(asteroid.close_approach_data[0]?.relative_velocity_km_s || 0);
    const diameterMin = asteroid.estimated_diameter_km?.min || 0;
    const diameterMax = asteroid.estimated_diameter_km?.max || 0;
    const diameter = (diameterMin + diameterMax) / 2;
    const score = (velocity * 1.5) + (diameter * 10);
    
    return Math.min(Math.round(score), 100);
};

export const getAsteroids = async (): Promise<Asteroid[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/asteroids`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch asteroid data');
        }
        
        const data = await response.json();
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
        const asteroids = await getAsteroids();
        return asteroids.find(a => a.id === id);
    } catch (error) {
        console.error("Error fetching asteroid details:", error);
        return undefined;
    }
};