import { PropertyState } from '@blue-marble/shared';


export const createPropertyState = (): PropertyState => {
  return {
    ownerPlayerId: null,
    buildingCounts: { villa: 0, building: 0, hotel: 0 },
  };

};
