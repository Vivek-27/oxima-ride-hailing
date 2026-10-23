import { searchCityLocations, CITIES_REGISTRY } from '../config/cities/index.js';

export const getCitySuggestions = (req, res) => {
  const { q = '', city = 'hyderabad' } = req.query;
  const results = searchCityLocations(q, city);

  res.status(200).json({
    status: 'success',
    city: city.toLowerCase(),
    resultsCount: results.length,
    data: {
      locations: results
    }
  });
};

export const getAvailableCities = (req, res) => {
  const cities = Object.keys(CITIES_REGISTRY).map(key => ({
    id: key,
    name: CITIES_REGISTRY[key].name,
    state: CITIES_REGISTRY[key].state,
    center: CITIES_REGISTRY[key].center,
    totalLandmarks: CITIES_REGISTRY[key].locations.length
  }));

  res.status(200).json({
    status: 'success',
    data: { cities }
  });
};
