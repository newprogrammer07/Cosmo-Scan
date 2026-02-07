// frontend/src/types.ts

export enum RiskLevel {
  None = 'None',
  Low = 'Low',
  Moderate = 'Moderate',
  High = 'High',
  Critical = 'Critical',
}

export interface Asteroid {
  id: string;
  name: string;
  estimated_diameter_km: {
    min: number;
    max: number;
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date_full: string;
    relative_velocity_km_s: string;
    miss_distance_km: string;
  }[];
  orbital_data: {
    orbital_period: string;
    eccentricity: string;
    inclination: string;
  };
  risk: RiskLevel;
  risk_score: number;
}