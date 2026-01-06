export enum TileType {
  START = 'start',
  PROPERTY = 'property',
  VEHICLE = 'vehicle',
  GOLDEN_KEY = 'goldenKey',
  ISLAND = 'island',
  TRAVEL = 'travel',
  FUND_RECEIVE = 'fundReceive',
  FUND_DONATE = 'fundDonate',
}

export enum BuildingType {
  NONE = 'none',
  VILLA = 'villa',
  BUILDING = 'building',
  HOTEL = 'hotel',
}

export enum PlayerColor {
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green',
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

export enum TransactionReason {
  PURCHASE = 'purchase',
  BUILD = 'build',
  RENT = 'rent',
  VEHICLE_FEE = 'vehicle_fee',
  SPACE_TRAVEL_FEE = 'space_travel_fee',
  FUND_DONATE = 'fund_donate',
  FUND_RECEIVE = 'fund_receive',
  GOLDEN_KEY = 'golden_key',
  SALARY = 'salary',
  START_BONUS = 'start_bonus',
  MORTGAGE = 'mortgage',
  UNMORTGAGE = 'unmortgage',
}
