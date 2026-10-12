export const CLIMATE_DIMENSIONS = ['temperature', 'humidity', 'continentalness', 'erosion', 'weirdness'] as const;
export type ClimateDimension = (typeof CLIMATE_DIMENSIONS)[number];
