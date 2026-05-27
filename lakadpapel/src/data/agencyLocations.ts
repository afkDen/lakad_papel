import { AgencyBranch } from '../context/types';

export const AGENCY_BRANCHES: AgencyBranch[] = [
  // DFA
  {
    id: 'dfa_aseana',
    name: 'DFA Aseana (Main Office)',
    agency: 'DFA',
    address: 'Aseana Business Park, Bradco Ave corner Macapagal Blvd, Parañaque City',
    city: 'Parañaque',
    latitude: 14.5268,
    longitude: 120.9904,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=DFA+Aseana+Main+Office',
  },
  {
    id: 'dfa_robinsons_galleria',
    name: 'DFA NCR East (Robinsons Galleria)',
    agency: 'DFA',
    address: 'Level 1, Robinsons Galleria, EDSA corner Ortigas Ave, Quezon City',
    city: 'Quezon City',
    latitude: 14.5936,
    longitude: 121.0592,
    hours: 'Mon–Fri 9:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=DFA+Robinsons+Galleria+Quezon+City',
  },
  {
    id: 'dfa_sm_megamall',
    name: 'DFA NCR Central (SM Megamall)',
    agency: 'DFA',
    address: 'Level 7, SM Megamall Building C, EDSA corner Julia Vargas Ave, Mandaluyong City',
    city: 'Mandaluyong',
    latitude: 14.5841,
    longitude: 121.0573,
    hours: 'Mon–Fri 10:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=DFA+SM+Megamall+Mandaluyong',
  },

  // NBI
  {
    id: 'nbi_main_office',
    name: 'NBI Main Office',
    agency: 'NBI',
    address: 'NBI Building, Taft Avenue, Ermita, Manila',
    city: 'Manila',
    latitude: 14.5804,
    longitude: 120.9818,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=NBI+Main+Office+Taft+Avenue+Manila',
  },
  {
    id: 'nbi_robinsons_ermita',
    name: 'NBI Clearance Center (Robinsons Place Ermita)',
    agency: 'NBI',
    address: 'Level 4, Robinsons Place Manila, Adriatico St, Ermita, Manila',
    city: 'Manila',
    latitude: 14.5796,
    longitude: 120.9854,
    hours: 'Mon–Fri 9:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=NBI+Robinsons+Place+Ermita+Manila',
  },
  {
    id: 'nbi_sm_north_edsa',
    name: 'NBI Clearance Center (SM City North EDSA)',
    agency: 'NBI',
    address: 'Level 5, Annex Building, SM City North EDSA, Quezon City',
    city: 'Quezon City',
    latitude: 14.6563,
    longitude: 121.0294,
    hours: 'Mon–Fri 10:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=NBI+SM+City+North+EDSA+Quezon+City',
  },

  // PSA
  {
    id: 'psa_sm_megamall',
    name: 'PSA Serbilis Outlet (SM Megamall)',
    agency: 'PSA',
    address: 'Level 5, SM Megamall Director\'s Club, Mandaluyong City',
    city: 'Mandaluyong',
    latitude: 14.5841,
    longitude: 121.0573,
    hours: 'Mon–Fri 10:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PSA+Serbilis+SM+Megamall+Mandaluyong',
  },
  {
    id: 'psa_sm_north_edsa',
    name: 'PSA Serbilis Outlet (SM City North EDSA)',
    agency: 'PSA',
    address: 'Level 5, Annex Building, SM City North EDSA, Quezon City',
    city: 'Quezon City',
    latitude: 14.6563,
    longitude: 121.0294,
    hours: 'Mon–Fri 10:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PSA+Serbilis+SM+North+EDSA+Quezon+City',
  },
  {
    id: 'psa_sm_mall_of_asia',
    name: 'PSA Serbilis Outlet (SM Mall of Asia)',
    agency: 'PSA',
    address: 'Level 2, SM Mall of Asia, Pasay City',
    city: 'Pasay',
    latitude: 14.5350,
    longitude: 120.9820,
    hours: 'Mon–Fri 10:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PSA+Serbilis+SM+Mall+of+Asia+Pasay',
  },

  // LTO
  {
    id: 'lto_ncr_district_office_7',
    name: 'LTO NCR East District Office (QC)',
    agency: 'LTO',
    address: 'LTO Compound, East Avenue, Diliman, Quezon City',
    city: 'Quezon City',
    latitude: 14.6433,
    longitude: 121.0475,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=LTO+East+Avenue+Diliman+Quezon+City',
  },
  {
    id: 'lto_ncr_district_office_4',
    name: 'LTO Tayuman District Office (Manila)',
    agency: 'LTO',
    address: 'Level 2, SM City San Lazaro, Tayuman St, Santa Cruz, Manila',
    city: 'Manila',
    latitude: 14.6167,
    longitude: 120.9833,
    hours: 'Mon–Fri 9:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=LTO+SM+City+San+Lazaro+Tayuman+Manila',
  },
  {
    id: 'lto_paranaque_district_office',
    name: 'LTO Parañaque District Office',
    agency: 'LTO',
    address: 'Airport Road corner Domestic Road, Parañaque City',
    city: 'Parañaque',
    latitude: 14.5240,
    longitude: 120.9984,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=LTO+Paranaque+District+Office',
  },

  // COMELEC
  {
    id: 'comelec_main_office',
    name: 'COMELEC Main Office',
    agency: 'COMELEC',
    address: 'Palacio del Gobernador, General Luna St, Intramuros, Manila',
    city: 'Manila',
    latitude: 14.5931,
    longitude: 120.9734,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=COMELEC+Main+Office+Intramuros+Manila',
  },
  {
    id: 'comelec_quezon_city',
    name: 'COMELEC Quezon City Office',
    agency: 'COMELEC',
    address: 'Quezon City Hall Compound, Diliman, Quezon City',
    city: 'Quezon City',
    latitude: 14.6464,
    longitude: 121.0494,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=COMELEC+Quezon+City+Office',
  },
  {
    id: 'comelec_makati',
    name: 'COMELEC Makati City Office',
    agency: 'COMELEC',
    address: 'Makati City Hall Compound, J.P. Rizal St, Makati City',
    city: 'Makati',
    latitude: 14.5701,
    longitude: 121.0272,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=COMELEC+Makati+City+Office',
  },

  // PHILSYS
  {
    id: 'philsys_psa_manila',
    name: 'PhilSys Registration Center — PSA Manila',
    agency: 'PHILSYS',
    address: 'PSA Civil Registry Outlet, 1705 Taft Avenue, Malate, Manila',
    city: 'Manila',
    latitude: 14.5739,
    longitude: 120.9880,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PhilSys+Registration+Center+PSA+Taft+Manila',
  },
  {
    id: 'philsys_sm_north_edsa',
    name: 'PhilSys Registration Center — SM City North EDSA',
    agency: 'PHILSYS',
    address: 'Level 5, Annex Building, SM City North EDSA, Quezon City',
    city: 'Quezon City',
    latitude: 14.6563,
    longitude: 121.0294,
    hours: 'Mon–Fri 10:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PhilSys+Registration+Center+SM+North+EDSA',
  },
  {
    id: 'philsys_sm_megamall',
    name: 'PhilSys Registration Center — SM Megamall',
    agency: 'PHILSYS',
    address: 'Level 5, SM Megamall Building B, Mandaluyong City',
    city: 'Mandaluyong',
    latitude: 14.5841,
    longitude: 121.0573,
    hours: 'Mon–Fri 10:00 AM – 6:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PhilSys+Registration+Center+SM+Megamall',
  },

  // PRC
  {
    id: 'prc_main_office',
    name: 'PRC Main Office (Manila)',
    agency: 'PRC',
    address: 'P. Paredes St corner Nicanor Reyes St, Sampaloc, Manila',
    city: 'Manila',
    latitude: 14.6057,
    longitude: 120.9890,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PRC+Main+Office+Sampaloc+Manila',
  },
  {
    id: 'prc_ncr_manila',
    name: 'PRC NCR Regional Office',
    agency: 'PRC',
    address: 'West Point St, Cubao, Quezon City',
    city: 'Quezon City',
    latitude: 14.6247,
    longitude: 121.0428,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PRC+NCR+Manila+Regional+Office',
  },
  {
    id: 'prc_lucky_chinatown',
    name: 'PRC Service Center (Lucky Chinatown Mall)',
    agency: 'PRC',
    address: 'Level 3, Lucky Chinatown Mall, Binondo, Manila',
    city: 'Manila',
    latitude: 14.6022,
    longitude: 120.9736,
    hours: 'Mon–Fri 9:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=PRC+Lucky+Chinatown+Mall+Binondo+Manila',
  },

  // SSS
  {
    id: 'sss_main_office',
    name: 'SSS Main Office (Quezon City)',
    agency: 'SSS',
    address: 'SSS Building, East Avenue, Diliman, Quezon City',
    city: 'Quezon City',
    latitude: 14.6429,
    longitude: 121.0483,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=SSS+Main+Office+East+Avenue+Quezon+City',
  },
  {
    id: 'sss_makati',
    name: 'SSS Makati Branch',
    agency: 'SSS',
    address: 'SSS Building, Sen. Gil Puyat Ave, Makati City',
    city: 'Makati',
    latitude: 14.5583,
    longitude: 121.0178,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=SSS+Makati+Branch+Gil+Puyat+Makati',
  },
  {
    id: 'sss_manila',
    name: 'SSS Manila Branch',
    agency: 'SSS',
    address: 'YMCA Building, 350 Antonio Villegas St, Ermita, Manila',
    city: 'Manila',
    latitude: 14.5815,
    longitude: 120.9806,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=SSS+Manila+Branch+Taft+Manila',
  },

  // GSIS
  {
    id: 'gsis_main_office',
    name: 'GSIS Main Office',
    agency: 'GSIS',
    address: 'GSIS Headquarters, Financial Center, Roxas Blvd, Pasay City',
    city: 'Pasay',
    latitude: 14.5447,
    longitude: 120.9803,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=GSIS+Main+Office+Pasay+City',
  },
  {
    id: 'gsis_ncr_branch',
    name: 'GSIS NCR Branch Office',
    agency: 'GSIS',
    address: 'GSIS Building, Arroceros corner Concepcion St, Ermita, Manila',
    city: 'Manila',
    latitude: 14.5925,
    longitude: 120.9814,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=GSIS+NCR+Branch+Manila',
  },
  {
    id: 'gsis_qc_branch',
    name: 'GSIS Quezon City Branch Office',
    agency: 'GSIS',
    address: 'GSIS Building, Elliptical Road, Diliman, Quezon City',
    city: 'Quezon City',
    latitude: 14.6467,
    longitude: 121.0481,
    hours: 'Mon–Fri 8:00 AM – 5:00 PM',
    mapsUrl: 'https://maps.google.com/?q=GSIS+Quezon+City+Branch+Office',
  },
];

export function buildProximityEdges(
  branches: AgencyBranch[],
  thresholdKm: number
): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();

  // Haversine formula distance helper
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize adjacency map
  for (const b of branches) {
    adjacency.set(b.id, []);
  }

  // Double loop to compute distances and populate edges
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      const distance = haversineKm(b1.latitude, b1.longitude, b2.latitude, b2.longitude);

      if (distance <= thresholdKm) {
        adjacency.get(b1.id)!.push(b2.id);
        adjacency.get(b2.id)!.push(b1.id);
      }
    }
  }

  return adjacency;
}
