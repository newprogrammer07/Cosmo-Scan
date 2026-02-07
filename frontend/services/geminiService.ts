
import { Asteroid, RiskLevel } from '../types';
import { useAppStore } from '../store/useAppStore';
import { demoAsteroids } from './demoData';

const mockAsteroids: Asteroid[] = [
  {
    id: '2023-QW',
    name: '(2023 QW)',
    estimated_diameter_km: { min: 0.8, max: 1.2 },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date_full: '2024-08-22 14:30',
      relative_velocity_km_s: '25.4',
      miss_distance_km: '5700000',
    }],
    orbital_data: { orbital_period: '450.5', eccentricity: '0.35', inclination: '12.5' },
    risk: RiskLevel.High,
  },
  {
    id: '2021-OR2',
    name: '(2021 OR2)',
    estimated_diameter_km: { min: 1.1, max: 2.5 },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date_full: '2025-01-15 08:00',
      relative_velocity_km_s: '19.8',
      miss_distance_km: '2300000',
    }],
    orbital_data: { orbital_period: '1023.1', eccentricity: '0.55', inclination: '32.1' },
    risk: RiskLevel.Critical,
  },
  {
    id: '2024-TY',
    name: '(2024 TY)',
    estimated_diameter_km: { min: 0.1, max: 0.25 },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [{
      close_approach_date_full: '2024-09-10 21:00',
      relative_velocity_km_s: '12.1',
      miss_distance_km: '45000000',
    }],
    orbital_data: { orbital_period: '320.7', eccentricity: '0.15', inclination: '5.8' },
    risk: RiskLevel.Low,
  },
  {
    id: 'NEO-1994',
    name: '(1994 PC1)',
    estimated_diameter_km: { min: 1.0, max: 1.3 },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date_full: '2026-03-05 12:45',
      relative_velocity_km_s: '35.2',
      miss_distance_km: '11200000',
    }],
    orbital_data: { orbital_period: '650.2', eccentricity: '0.22', inclination: '25.3' },
    risk: RiskLevel.Moderate,
  },
  {
    id: 'Ceres-Minor',
    name: '(Ceres Minor)',
    estimated_diameter_km: { min: 0.05, max: 0.1 },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [{
      close_approach_date_full: '2024-11-30 05:00',
      relative_velocity_km_s: '8.9',
      miss_distance_km: '78000000',
    }],
    orbital_data: { orbital_period: '250.9', eccentricity: '0.08', inclination: '2.1' },
    risk: RiskLevel.None,
  },
];

const getDataSource = () => {
  const isDemoMode = useAppStore.getState().isDemoMode;
  return isDemoMode ? demoAsteroids : mockAsteroids;
};

export const getAsteroids = (): Promise<Asteroid[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getDataSource());
    }, 1000);
  });
};

export const getAsteroidById = (id: string): Promise<Asteroid | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dataSource = getDataSource();
      const asteroid = dataSource.find((a) => a.id === id);
      resolve(asteroid);
    }, 500);
  });
};
