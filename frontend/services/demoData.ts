
import { Asteroid, RiskLevel } from '../types';

export const demoAsteroids: Asteroid[] = [
  {
    id: 'DEMO-APOLLO',
    name: '(Demo) Apollo',
    estimated_diameter_km: { min: 1.5, max: 1.7 },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date_full: '2024-12-25 10:00',
      relative_velocity_km_s: '15.0',
      miss_distance_km: '4800000',
    }],
    orbital_data: { orbital_period: '652.5', eccentricity: '0.56', inclination: '15.2' },
    risk: RiskLevel.Critical,
  },
  {
    id: 'DEMO-EROS',
    name: '(Demo) Eros',
    estimated_diameter_km: { min: 0.5, max: 0.8 },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date_full: '2025-02-14 18:30',
      relative_velocity_km_s: '22.3',
      miss_distance_km: '15000000',
    }],
    orbital_data: { orbital_period: '430.1', eccentricity: '0.22', inclination: '10.8' },
    risk: RiskLevel.High,
  },
  {
    id: 'DEMO-JUNO',
    name: '(Demo) Juno',
    estimated_diameter_km: { min: 0.2, max: 0.3 },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [{
      close_approach_date_full: '2024-10-31 06:00',
      relative_velocity_km_s: '10.5',
      miss_distance_km: '35000000',
    }],
    orbital_data: { orbital_period: '280.9', eccentricity: '0.12', inclination: '4.5' },
    risk: RiskLevel.Low,
  },
   {
    id: 'DEMO-PALLAS',
    name: '(Demo) Pallas',
    estimated_diameter_km: { min: 0.9, max: 1.1 },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date_full: '2026-06-18 22:15',
      relative_velocity_km_s: '18.9',
      miss_distance_km: '9800000',
    }],
    orbital_data: { orbital_period: '890.2', eccentricity: '0.23', inclination: '34.8' },
    risk: RiskLevel.Moderate,
  },
];
