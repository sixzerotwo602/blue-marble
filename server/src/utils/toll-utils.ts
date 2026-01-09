import { PropertySpec } from '@blue-marble/shared';


export const calculateToll = (spec: PropertySpec, buildingCounts: { villa: number; building: number; hotel: number }): number => {
  if (spec.tileType === 'vehicle') {
    return spec.toll.land;
  }

  let total = spec.toll.land;

  // Add Villa Toll
  if (buildingCounts.villa === 1) {
    total += spec.toll.villa;
  } else if (buildingCounts.villa >= 2) {
    total += spec.toll.villa2;
  }

  // Add Building Toll
  if (buildingCounts.building > 0) {
    total += spec.toll.building;
  }

  // Add Hotel Toll
  if (buildingCounts.hotel > 0) {
    total += spec.toll.hotel;
  }

  return total;
};

