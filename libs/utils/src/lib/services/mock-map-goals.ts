import { AlgoliaGoal, createAlgoliaGoal } from '@strive/model'
import { environment } from 'environments/environment'

/**
 * Mock goals for the explore/home maps until real goals have locations.
 * Shown automatically in dev builds; on production builds they can be
 * previewed by running `localStorage.setItem('mock-map-goals', 'true')`.
 *
 * Several goals share the exact same coordinates (Amsterdam, New York,
 * London, Tokyo) and others are close together (Randstad cities) to
 * exercise cluster grouping and cluster expansion on zoom.
 */
const mock = (id: string, title: string, lat: number, lng: number, locationName: string, numberOfAchievers = 1) =>
  ({ id: `mock-${id}`, title, numberOfAchievers, _geoloc: { lat, lng }, locationName })

const MOCK_MAP_GOALS: AlgoliaGoal[] = [
  // Amsterdam - 5 goals at the exact same spot
  mock('ams-marathon', 'Run the Amsterdam Marathon', 52.3676, 4.9041, 'Amsterdam, Netherlands', 3),
  mock('ams-dutch', 'Learn Dutch', 52.3676, 4.9041, 'Amsterdam, Netherlands'),
  mock('ams-foodtruck', 'Start a food truck', 52.3676, 4.9041, 'Amsterdam, Netherlands'),
  mock('ams-cycle', 'Cycle to work every day', 52.3676, 4.9041, 'Amsterdam, Netherlands', 2),
  mock('ams-canals', 'Swim the Amsterdam City Swim', 52.3676, 4.9041, 'Amsterdam, Netherlands'),
  // Randstad - nearby cities, cluster with Amsterdam when zoomed out
  mock('utrecht', 'Graduate university', 52.0907, 5.1214, 'Utrecht, Netherlands', 2),
  mock('rotterdam', 'Run the Rotterdam Marathon', 51.9244, 4.4777, 'Rotterdam, Netherlands'),
  mock('haarlem', 'Grow a vegetable garden', 52.3874, 4.6462, 'Haarlem, Netherlands'),
  mock('denhaag', 'Learn to kitesurf at Scheveningen', 52.0705, 4.3007, 'The Hague, Netherlands'),
  // New York - 3 goals at the exact same spot
  mock('ny-marathon', 'Run the New York Marathon', 40.7128, -74.006, 'New York, United States', 2),
  mock('ny-standup', 'Perform stand-up comedy', 40.7128, -74.006, 'New York, United States'),
  mock('ny-wallstreet', 'Land a job on Wall Street', 40.7128, -74.006, 'New York, United States'),
  // London - 2 goals at the exact same spot
  mock('london-football', 'Watch a Premier League match', 51.5074, -0.1278, 'London, United Kingdom'),
  mock('london-marathon', 'Run the London Marathon', 51.5074, -0.1278, 'London, United Kingdom', 4),
  // Tokyo - 3 goals at the exact same spot
  mock('tokyo-japanese', 'Learn Japanese', 35.6762, 139.6503, 'Tokyo, Japan', 2),
  mock('tokyo-sakura', 'See the cherry blossoms', 35.6762, 139.6503, 'Tokyo, Japan'),
  mock('tokyo-sumo', 'Attend a sumo tournament', 35.6762, 139.6503, 'Tokyo, Japan'),
  // Europe singles
  mock('berlin', 'Learn German', 52.52, 13.405, 'Berlin, Germany'),
  mock('paris', 'Learn French pastry baking', 48.8566, 2.3522, 'Paris, France', 2),
  mock('rome', 'Visit the Colosseum', 41.9028, 12.4964, 'Rome, Italy'),
  mock('barcelona', 'See a game at Camp Nou', 41.3874, 2.1686, 'Barcelona, Spain'),
  mock('tromso', 'See the Northern Lights', 69.6492, 18.9553, 'Tromsø, Norway', 2),
  mock('reykjavik', 'Bathe in the Blue Lagoon', 64.1466, -21.9426, 'Reykjavík, Iceland'),
  mock('alps', 'Climb the Matterhorn', 45.9766, 7.6585, 'Matterhorn, Switzerland'),
  // Americas
  mock('route66', 'Road trip along Route 66', 35.0844, -106.6504, 'Albuquerque, United States'),
  mock('sf', 'Cycle across the Golden Gate Bridge', 37.7749, -122.4194, 'San Francisco, United States'),
  mock('vancouver', 'Ski in Whistler', 49.2827, -123.1207, 'Vancouver, Canada'),
  mock('inca', 'Hike the Inca Trail', -13.1631, -72.545, 'Machu Picchu, Peru'),
  mock('tango', 'Learn tango', -34.6037, -58.3816, 'Buenos Aires, Argentina'),
  mock('rio', 'Dance at Carnival', -22.9068, -43.1729, 'Rio de Janeiro, Brazil', 2),
  mock('havana', 'Learn salsa', 23.1136, -82.3666, 'Havana, Cuba'),
  // Africa & Middle East
  mock('kilimanjaro', 'Climb Kilimanjaro', -3.0674, 37.3556, 'Kilimanjaro, Tanzania', 2),
  mock('capetown', 'Hike Table Mountain', -33.9249, 18.4241, 'Cape Town, South Africa'),
  mock('giza', 'See the pyramids of Giza', 30.0444, 31.2357, 'Cairo, Egypt'),
  // Asia & Oceania
  mock('everest', 'Trek to Everest Base Camp', 27.7172, 85.324, 'Kathmandu, Nepal'),
  mock('taj', 'Visit the Taj Mahal', 27.1751, 78.0421, 'Agra, India'),
  mock('bangkok', 'Learn Thai cooking', 13.7563, 100.5018, 'Bangkok, Thailand'),
  mock('bali', 'Learn to surf', -8.65, 115.13, 'Canggu, Indonesia', 3),
  mock('fuji', 'Climb Mount Fuji', 35.3606, 138.7274, 'Mount Fuji, Japan'),
  mock('sydney', 'Surf at Bondi Beach', -33.8688, 151.2093, 'Sydney, Australia'),
  mock('nz', 'Campervan around New Zealand', -41.2866, 174.7756, 'Wellington, New Zealand', 2)
].map(goal => createAlgoliaGoal({ image: '', categories: [], numberOfSupporters: 0, ...goal }))

function mocksEnabled(): boolean {
  if (!environment.production) return true
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('mock-map-goals') === 'true'
  } catch {
    return false
  }
}

/** Mock goals within the given bounding box: [north, east, south, west] */
export function getMockMapGoals(bounds: [number, number, number, number]): AlgoliaGoal[] {
  if (!mocksEnabled()) return []

  const [north, east, south, west] = bounds
  return MOCK_MAP_GOALS.filter(({ _geoloc }) => {
    if (!_geoloc) return false
    const inLat = _geoloc.lat <= north && _geoloc.lat >= south
    const inLng = west <= east
      ? _geoloc.lng >= west && _geoloc.lng <= east
      : _geoloc.lng >= west || _geoloc.lng <= east // box crosses the antimeridian
    return inLat && inLng
  })
}
