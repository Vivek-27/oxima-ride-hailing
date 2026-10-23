import { INDIAN_CITIES_REGISTRY, detectCityFromCoords, searchAllIndiaLocations } from './indianCities.js';

export { INDIAN_CITIES_REGISTRY, detectCityFromCoords, searchAllIndiaLocations };

export const CITIES_REGISTRY = INDIAN_CITIES_REGISTRY;

export const searchCityLocations = (query, cityName = 'all_india') => {
  return searchAllIndiaLocations(query, cityName);
};
