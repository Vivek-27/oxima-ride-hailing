import api from './api';

// Comprehensive Indian Landmarks Database for fast instant autocomplete
const ALL_INDIA_LANDMARKS = [
  // Bengaluru
  { name: 'Koramangala 5th Block', displayName: 'Koramangala 5th Block, Bengaluru, Karnataka', coordinates: [77.6200, 12.9352], city: 'Bengaluru' },
  { name: 'Indiranagar 100ft Road', displayName: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka', coordinates: [77.6412, 12.9719], city: 'Bengaluru' },
  { name: 'Whitefield IT Park (ITPB)', displayName: 'ITPB, Whitefield Main Rd, Bengaluru, Karnataka', coordinates: [77.7499, 12.9856], city: 'Bengaluru' },
  { name: 'Electronic City Phase 1', displayName: 'Infosys Campus, Electronic City, Bengaluru, Karnataka', coordinates: [77.6648, 12.8399], city: 'Bengaluru' },
  { name: 'Kempegowda International Airport (BLR)', displayName: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka', coordinates: [77.7066, 13.1986], city: 'Bengaluru' },
  { name: 'MG Road Metro Station', displayName: 'MG Road, Shanthala Nagar, Bengaluru, Karnataka', coordinates: [77.6066, 12.9756], city: 'Bengaluru' },

  // Mumbai
  { name: 'Bandra Kurla Complex (BKC)', displayName: 'G Block, BKC, Bandra East, Mumbai, Maharashtra', coordinates: [72.8682, 19.0664], city: 'Mumbai' },
  { name: 'Chhatrapati Shivaji Maharaj Airport (BOM)', displayName: 'Sahar, Andheri East, Mumbai, Maharashtra', coordinates: [72.8679, 19.0896], city: 'Mumbai' },
  { name: 'Gateway of India, Colaba', displayName: 'Apollo Bandar, Colaba, Mumbai, Maharashtra', coordinates: [72.8347, 18.9220], city: 'Mumbai' },
  { name: 'Andheri West Metro Station', displayName: 'SV Road, Andheri West, Mumbai, Maharashtra', coordinates: [72.8467, 19.1197], city: 'Mumbai' },
  { name: 'Powai Hiranandani Gardens', displayName: 'Central Ave, Hiranandani Gardens, Powai, Mumbai', coordinates: [72.9133, 19.1197], city: 'Mumbai' },
  { name: 'Lower Parel Phoenix Palladium', displayName: 'Senapati Bapat Marg, Lower Parel, Mumbai', coordinates: [72.8242, 18.9953], city: 'Mumbai' },

  // Delhi NCR
  { name: 'Connaught Place (Inner Circle)', displayName: 'Connaught Place, New Delhi, Delhi', coordinates: [77.2167, 28.6315], city: 'Delhi NCR' },
  { name: 'Indira Gandhi International Airport (DEL)', displayName: 'Palam, New Delhi, Delhi', coordinates: [77.1000, 28.5562], city: 'Delhi NCR' },
  { name: 'Cyber City, DLF Phase 2, Gurgaon', displayName: 'DLF Cyber City, Sector 24, Gurugram, Haryana', coordinates: [77.0878, 28.4952], city: 'Delhi NCR' },
  { name: 'Sector 18 Market & Mall, Noida', displayName: 'Sector 18, Noida, Uttar Pradesh', coordinates: [77.3244, 28.5708], city: 'Delhi NCR' },
  { name: 'India Gate', displayName: 'Rajpath, India Gate, New Delhi, Delhi', coordinates: [77.2295, 28.6129], city: 'Delhi NCR' },

  // Hyderabad
  { name: 'Cyber Towers, Hitec City', displayName: 'Cyber Towers, Hitec City Main Rd, Hyderabad, Telangana', coordinates: [78.3772, 17.4504], city: 'Hyderabad' },
  { name: 'Mindspace IT Park, Madhapur', displayName: 'Mindspace Cyberabad, Madhapur, Hyderabad', coordinates: [78.3844, 17.4399], city: 'Hyderabad' },
  { name: 'Financial District, Gachibowli', displayName: 'Financial District, Nanakramguda, Hyderabad', coordinates: [78.3498, 17.4156], city: 'Hyderabad' },
  { name: 'Inorbit Mall, Madhapur', displayName: 'Inorbit Mall Rd, Madhapur, Hyderabad', coordinates: [78.3867, 17.4342], city: 'Hyderabad' },
  { name: 'Rajiv Gandhi International Airport (HYD)', displayName: 'Shamshabad, Hyderabad, Telangana', coordinates: [78.4294, 17.2403], city: 'Hyderabad' },
  { name: 'Charminar Heritage Plaza', displayName: 'Charminar, Old City, Hyderabad, Telangana', coordinates: [78.4747, 17.3616], city: 'Hyderabad' },
  { name: 'Jubilee Hills Check Post', displayName: 'Road No 36, Jubilee Hills, Hyderabad', coordinates: [78.4116, 17.4285], city: 'Hyderabad' },

  // Chennai
  { name: 'T Nagar Pondy Bazaar', displayName: 'Pondy Bazaar, T. Nagar, Chennai, Tamil Nadu', coordinates: [80.2337, 13.0418], city: 'Chennai' },
  { name: 'OMR IT Corridor (Tidel Park)', displayName: 'Rajiv Gandhi Salai, Taramani, Chennai', coordinates: [80.2514, 12.9897], city: 'Chennai' },
  { name: 'Chennai International Airport (MAA)', displayName: 'GST Rd, Meenambakkam, Chennai, Tamil Nadu', coordinates: [80.1709, 12.9941], city: 'Chennai' },

  // Kolkata
  { name: 'Park Street Cultural Hub', displayName: 'Mother Teresa Sarani, Park Street, Kolkata', coordinates: [88.3527, 22.5518], city: 'Kolkata' },
  { name: 'Salt Lake Sector V (IT Hub)', displayName: 'Sector V, Bidhannagar, Kolkata, West Bengal', coordinates: [88.4312, 22.5735], city: 'Kolkata' },
  { name: 'Netaji Subhash Chandra Bose Airport (CCU)', displayName: 'Dum Dum, Kolkata, West Bengal', coordinates: [88.4467, 22.6547], city: 'Kolkata' },

  // Pune
  { name: 'Hinjawadi Rajiv Gandhi Infotech Park', displayName: 'Hinjawadi Phase 1, Pune, Maharashtra', coordinates: [73.7380, 18.5913], city: 'Pune' },
  { name: 'Koregaon Park North Main Rd', displayName: 'Koregaon Park, Pune, Maharashtra', coordinates: [73.8967, 18.5362], city: 'Pune' },
  { name: 'Pune International Airport (PNQ)', displayName: 'New Airport Rd, Lohegaon, Pune, Maharashtra', coordinates: [73.9197, 18.5822], city: 'Pune' },

  // Ahmedabad
  { name: 'SG Highway Corporate Corridor', displayName: 'SG Highway, Ahmedabad, Gujarat', coordinates: [72.5085, 23.0456], city: 'Ahmedabad' },
  { name: 'Sardar Vallabhbhai Patel Airport (AMD)', displayName: 'Hansol, Ahmedabad, Gujarat', coordinates: [72.6347, 23.0734], city: 'Ahmedabad' },
  { name: 'GIFT City Finance Hub', displayName: 'GIFT City, Gandhinagar, Gujarat', coordinates: [72.6841, 23.1612], city: 'Ahmedabad' }
];

/**
 * Search locations across ALL of India using local registry + OpenStreetMap India geocoding
 */
export const searchIndianLocations = async (query) => {
  if (!query || query.trim().length < 1) return [];

  const cleanQuery = query.toLowerCase().trim();

  // 1. Fast instant matches from All-India database
  const localMatches = ALL_INDIA_LANDMARKS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(cleanQuery) ||
      loc.displayName.toLowerCase().includes(cleanQuery) ||
      loc.city.toLowerCase().includes(cleanQuery)
  );

  // 2. Query OpenStreetMap Nominatim bounded strictly to India
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=in&limit=8&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-IN,en;q=0.9'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const nominatimResults = data.map((item) => {
        const title = item.address?.road || item.address?.suburb || item.address?.neighbourhood || item.name || item.display_name.split(',')[0];
        const subtitle = item.display_name;
        return {
          name: title,
          displayName: subtitle,
          coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
          city: item.address?.city || item.address?.state_district || 'India'
        };
      });

      // Deduplicate results
      const combined = [...localMatches];
      nominatimResults.forEach((nr) => {
        if (!combined.some((c) => Math.abs(c.coordinates[0] - nr.coordinates[0]) < 0.005 && Math.abs(c.coordinates[1] - nr.coordinates[1]) < 0.005)) {
          combined.push(nr);
        }
      });

      return combined.slice(0, 10);
    }
  } catch (err) {
    console.warn('Geocoding notice:', err.message);
  }

  return localMatches.slice(0, 8);
};

/**
 * Reverse geocode any GPS coordinate in India to a readable place name
 */
export const reverseGeocodeIndia = async (lat, lon) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en-IN,en;q=0.9' }
    });

    if (res.ok) {
      const data = await res.json();
      const name = data.address?.road || data.address?.suburb || data.address?.neighbourhood || data.display_name.split(',')[0];
      return {
        name: name,
        displayName: data.display_name,
        city: data.address?.city || data.address?.state_district || 'India'
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding notice:', err.message);
  }

  return {
    name: 'Current Location',
    displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    city: 'India'
  };
};
