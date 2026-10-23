export const INDIAN_CITIES_REGISTRY = {
  all_india: {
    id: 'all_india',
    name: 'All India (Global)',
    state: 'India',
    center: [78.9629, 20.5937],
    locations: []
  },
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    center: [77.5946, 12.9716],
    latRange: [12.75, 13.2],
    lngRange: [77.4, 77.8],
    locations: [
      {
        name: 'Koramangala 5th Block',
        address: 'Koramangala 5th Block, Bengaluru, Karnataka 560095',
        category: 'Hub',
        coordinates: [77.62, 12.9352]
      },
      {
        name: 'Indiranagar 100ft Road',
        address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
        category: 'Shopping',
        coordinates: [77.6412, 12.9719]
      },
      {
        name: 'Whitefield IT Park',
        address: 'ITPB, Whitefield Main Rd, Bengaluru, Karnataka 560066',
        category: 'Tech Park',
        coordinates: [77.7499, 12.9856]
      },
      {
        name: 'Electronic City Phase 1',
        address: 'Infosys Campus, Electronic City, Bengaluru, Karnataka 560100',
        category: 'Tech Park',
        coordinates: [77.6648, 12.8399]
      },
      {
        name: 'Kempegowda International Airport (BLR)',
        address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
        category: 'Airport',
        coordinates: [77.7066, 13.1986]
      },
      {
        name: 'MG Road Metro Station',
        address: 'MG Road, Shanthala Nagar, Bengaluru, Karnataka 560001',
        category: 'Transit',
        coordinates: [77.6066, 12.9756]
      },
      {
        name: 'HSR Layout Sector 1',
        address: '27th Main Rd, HSR Layout Sector 1, Bengaluru 560102',
        category: 'Residential',
        coordinates: [77.6533, 12.9121]
      },
      {
        name: 'Bangalore City Railway Station (SBC)',
        address: 'Majestic, Bengaluru, Karnataka 560023',
        category: 'Transit',
        coordinates: [77.567, 12.9781]
      }
    ]
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    center: [72.8777, 19.076],
    latRange: [18.88, 19.3],
    lngRange: [72.75, 73.05],
    locations: [
      {
        name: 'Bandra Kurla Complex (BKC)',
        address: 'G Block, Bandra Kurla Complex, Bandra East, Mumbai 400051',
        category: 'Business District',
        coordinates: [72.8682, 19.0664]
      },
      {
        name: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
        address: 'Sahar, Andheri East, Mumbai, Maharashtra 400099',
        category: 'Airport',
        coordinates: [72.8679, 19.0896]
      },
      {
        name: 'Gateway of India, Colaba',
        address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
        category: 'Landmark',
        coordinates: [72.8347, 18.922]
      },
      {
        name: 'Andheri West Metro Station',
        address: 'SV Road, Andheri West, Mumbai, Maharashtra 400058',
        category: 'Transit',
        coordinates: [72.8467, 19.1197]
      },
      {
        name: 'Powai Hiranandani Gardens',
        address: 'Central Ave, Hiranandani Gardens, Powai, Mumbai 400076',
        category: 'Tech & Residential',
        coordinates: [72.9133, 19.1197]
      },
      {
        name: 'Nariman Point Financial Hub',
        address: 'Marine Drive, Nariman Point, Mumbai, Maharashtra 400021',
        category: 'Business District',
        coordinates: [72.8228, 18.9256]
      },
      {
        name: 'Lower Parel Phoenix Palladium',
        address: 'Senapati Bapat Marg, Lower Parel, Mumbai 400013',
        category: 'Mall',
        coordinates: [72.8242, 18.9953]
      },
      {
        name: 'CSMT Central Railway Terminus',
        address: 'Fort, Mumbai, Maharashtra 400001',
        category: 'Transit',
        coordinates: [72.8358, 18.9401]
      }
    ]
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    center: [77.209, 28.6139],
    latRange: [28.35, 28.85],
    lngRange: [76.9, 77.45],
    locations: [
      {
        name: 'Connaught Place (Inner Circle)',
        address: 'Connaught Place, New Delhi, Delhi 110001',
        category: 'Hub',
        coordinates: [77.2167, 28.6315]
      },
      {
        name: 'Indira Gandhi International Airport (DEL)',
        address: 'Palam, New Delhi, Delhi 110037',
        category: 'Airport',
        coordinates: [77.1, 28.5562]
      },
      {
        name: 'Cyber City, DLF Phase 2, Gurgaon',
        address: 'DLF Cyber City, Sector 24, Gurugram, Haryana 122002',
        category: 'Tech Park',
        coordinates: [77.0878, 28.4952]
      },
      {
        name: 'Sector 18 Market & Mall, Noida',
        address: 'Sector 18, Noida, Uttar Pradesh 201301',
        category: 'Mall',
        coordinates: [77.3244, 28.5708]
      },
      {
        name: 'New Delhi Railway Station (NDLS)',
        address: 'Bhavbhuti Marg, Ratan Lal Market, New Delhi 110006',
        category: 'Transit',
        coordinates: [77.2197, 28.6431]
      },
      {
        name: 'Hauz Khas Social & Village',
        address: 'Hauz Khas Village, Deer Park, New Delhi 110016',
        category: 'Hub',
        coordinates: [77.1942, 28.5535]
      },
      {
        name: 'India Gate',
        address: 'Rajpath, India Gate, New Delhi, Delhi 110001',
        category: 'Landmark',
        coordinates: [77.2295, 28.6129]
      }
    ]
  },
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    center: [78.3772, 17.4504],
    latRange: [17.2, 17.6],
    lngRange: [78.2, 78.6],
    locations: [
      {
        name: 'Cyber Towers, Hitec City',
        address: 'Hitec City Main Rd, Patrika Nagar, Hyderabad 500081',
        category: 'Tech Park',
        coordinates: [78.3772, 17.4504]
      },
      {
        name: 'Mindspace IT Park, Madhapur',
        address: 'Mindspace Cyberabad, Madhapur, Hyderabad 500081',
        category: 'Tech Park',
        coordinates: [78.3844, 17.4399]
      },
      {
        name: 'Financial District, Gachibowli',
        address: 'Financial District, Nanakramguda, Hyderabad 500032',
        category: 'Business District',
        coordinates: [78.3498, 17.4156]
      },
      {
        name: 'Inorbit Mall, Madhapur',
        address: 'Inorbit Mall Rd, Mindspace, Madhapur, Hyderabad 500081',
        category: 'Mall',
        coordinates: [78.3867, 17.4342]
      },
      {
        name: 'Rajiv Gandhi International Airport (HYD)',
        address: 'Shamshabad, Hyderabad, Telangana 500409',
        category: 'Airport',
        coordinates: [78.4294, 17.2403]
      },
      {
        name: 'Charminar Heritage Plaza',
        address: 'Charminar, Old City, Hyderabad, Telangana 500002',
        category: 'Landmark',
        coordinates: [78.4747, 17.3616]
      },
      {
        name: 'Jubilee Hills Check Post',
        address: 'Road No 36, Jubilee Hills, Hyderabad 500033',
        category: 'Hub',
        coordinates: [78.4116, 17.4285]
      },
      {
        name: 'IKEA Hyderabad',
        address: 'Raidurg, Serilingampally, Hyderabad, Telangana 500081',
        category: 'Shopping',
        coordinates: [78.3732, 17.4375]
      }
    ]
  },
  chennai: {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    center: [80.2707, 13.0827],
    latRange: [12.85, 13.25],
    lngRange: [80.05, 80.35],
    locations: [
      {
        name: 'T Nagar Pondy Bazaar',
        address: 'Pondy Bazaar, T. Nagar, Chennai, Tamil Nadu 600017',
        category: 'Shopping',
        coordinates: [80.2337, 13.0418]
      },
      {
        name: 'OMR IT Corridor (Tidel Park)',
        address: 'Rajiv Gandhi Salai, Taramani, Chennai 600113',
        category: 'Tech Park',
        coordinates: [80.2514, 12.9897]
      },
      {
        name: 'Chennai International Airport (MAA)',
        address: 'GST Rd, Meenambakkam, Chennai, Tamil Nadu 600027',
        category: 'Airport',
        coordinates: [80.1709, 12.9941]
      },
      {
        name: 'Marina Beach Promenade',
        address: 'Marina Beach, Triplicane, Chennai, Tamil Nadu 600005',
        category: 'Landmark',
        coordinates: [80.2824, 13.05]
      },
      {
        name: 'Chennai Central Railway Station (MAS)',
        address: 'Kannappar Thidal, Periyamet, Chennai 600003',
        category: 'Transit',
        coordinates: [80.2755, 13.0823]
      }
    ]
  },
  kolkata: {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    center: [88.3639, 22.5726],
    latRange: [22.4, 22.75],
    lngRange: [88.2, 88.5],
    locations: [
      {
        name: 'Park Street Cultural Hub',
        address: 'Mother Teresa Sarani, Park Street, Kolkata 700016',
        category: 'Hub',
        coordinates: [88.3527, 22.5518]
      },
      {
        name: 'Salt Lake Sector V (IT Hub)',
        address: 'Sector V, Bidhannagar, Kolkata, West Bengal 700091',
        category: 'Tech Park',
        coordinates: [88.4312, 22.5735]
      },
      {
        name: 'Netaji Subhash Chandra Bose Airport (CCU)',
        address: 'Dum Dum, Kolkata, West Bengal 700052',
        category: 'Airport',
        coordinates: [88.4467, 22.6547]
      },
      {
        name: 'Howrah Railway Station',
        address: 'Howrah Railway Station, Howrah, West Bengal 711101',
        category: 'Transit',
        coordinates: [88.3426, 22.5855]
      },
      {
        name: 'Victoria Memorial',
        address: 'Queens Way, Maidan, Kolkata, West Bengal 700071',
        category: 'Landmark',
        coordinates: [88.3426, 22.5448]
      }
    ]
  },
  ahmedabad: {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    center: [72.5714, 23.0225],
    latRange: [22.85, 23.2],
    lngRange: [72.4, 72.75],
    locations: [
      {
        name: 'SG Highway Corporate Corridor',
        address: 'Sarkhej - Gandhinagar Hwy, Ahmedabad, Gujarat 380054',
        category: 'Business District',
        coordinates: [72.5085, 23.0456]
      },
      {
        name: 'Sardar Vallabhbhai Patel Airport (AMD)',
        address: 'Hansol, Ahmedabad, Gujarat 380003',
        category: 'Airport',
        coordinates: [72.6347, 23.0734]
      },
      {
        name: 'GIFT City Finance Hub',
        address: 'GIFT City, Gandhinagar, Gujarat 382355',
        category: 'Tech Park',
        coordinates: [72.6841, 23.1612]
      },
      {
        name: 'Sabarmati Riverfront Promenade',
        address: 'Sabarmati Riverfront, Ahmedabad, Gujarat 380009',
        category: 'Landmark',
        coordinates: [72.5714, 23.0338]
      }
    ]
  },
  jaipur: {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    center: [75.7873, 26.9124],
    latRange: [26.75, 27.05],
    lngRange: [75.65, 75.95],
    locations: [
      {
        name: 'MI Road & World Trade Park',
        address: 'JLN Marg, Malviya Nagar, Jaipur, Rajasthan 302017',
        category: 'Shopping',
        coordinates: [75.8056, 26.8536]
      },
      {
        name: 'Jaipur International Airport (JAI)',
        address: 'Sanganer, Jaipur, Rajasthan 302029',
        category: 'Airport',
        coordinates: [75.8067, 26.8289]
      },
      {
        name: 'Hawa Mahal Palace',
        address: 'Badi Choupad, J.D.A. Market, Jaipur, Rajasthan 302002',
        category: 'Landmark',
        coordinates: [75.8267, 26.9239]
      }
    ]
  },
  kochi: {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    center: [76.2673, 9.9312],
    latRange: [9.8, 10.15],
    lngRange: [76.15, 76.45],
    locations: [
      {
        name: 'Kakkanad Infopark',
        address: 'Infopark Expressway, Kakkanad, Kochi, Kerala 682042',
        category: 'Tech Park',
        coordinates: [76.3639, 10.0134]
      },
      {
        name: 'Cochin International Airport (COK)',
        address: 'Nedumbassery, Kochi, Kerala 683111',
        category: 'Airport',
        coordinates: [76.4019, 10.1518]
      },
      {
        name: 'Lulu International Mall, Edapally',
        address: 'NH 544, Edappally, Kochi, Kerala 682024',
        category: 'Mall',
        coordinates: [76.309, 10.0275]
      }
    ]
  }
};

/**
 * Detect which Indian city a coordinate pair [lat, lng] belongs to
 */
export const detectCityFromCoords = (lat, lng) => {
  if (!lat || !lng) return 'all_india';

  for (const [key, city] of Object.entries(INDIAN_CITIES_REGISTRY)) {
    if (city.latRange && city.lngRange) {
      if (
        lat >= city.latRange[0] &&
        lat <= city.latRange[1] &&
        lng >= city.lngRange[0] &&
        lng <= city.lngRange[1]
      ) {
        return key;
      }
    }
  }

  return 'all_india';
};

/**
 * Search locations all across India
 */
export const searchAllIndiaLocations = (query, cityName = 'all_india') => {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();

  // If specific city requested
  if (
    cityName &&
    cityName !== 'all_india' &&
    INDIAN_CITIES_REGISTRY[cityName]
  ) {
    return INDIAN_CITIES_REGISTRY[cityName].locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q)
    );
  }

  // Otherwise search across all Indian cities
  const allLocations = [];
  for (const city of Object.values(INDIAN_CITIES_REGISTRY)) {
    for (const loc of city.locations) {
      if (
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q)
      ) {
        allLocations.push({ ...loc, city: city.name });
      }
    }
  }

  return allLocations.slice(0, 12);
};
