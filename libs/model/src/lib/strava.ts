export interface StravaIntegration {
  id: string
  athleteId: string
  uid: string
  goalId: string
  activityTypes: ActivityType[]
  totalActivities: number
  totalDistance: number
  totalMovingTime: number
  totalElevationGain: number
  createdAt: Date
  updatedAt: Date
}

export function createStravaIntegration(params?: Partial<StravaIntegration>): StravaIntegration {
  return {
    id: '',
    athleteId: '',
    uid: '',
    goalId: '',
    activityTypes: [],
    totalActivities: 0,
    totalDistance: 0,
    totalMovingTime: 0,
    totalElevationGain: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params
  }
}

export interface StravaAuthParams {
  code: string
  scope: string
  activity: string
}

export function createStravaAuthParams(params: Partial<StravaAuthParams>): StravaAuthParams {
  return {
    code: params.code ?? '',
    scope: params.scope ?? '',
    activity: params.activity ?? ''
  }
}

// https://developers.strava.com/docs/reference/#api-models-ActivityType
export const activityTypes = [
  "AlpineSki",
  "BackcountrySki",
  "Canoeing",
  "Crossfit",
  "EBikeRide",
  "Elliptical",
  "Golf",
  "Handcycle",
  "Hike",
  "IceSkate",
  "InlineSkate",
  "Kayaking",
  "Kitesurf",
  "NordicSki",
  "Ride",
  "RockClimbing",
  "RollerSki",
  "Rowing",
  "Run",
  "Sail",
  "Skateboard",
  "Snowboard",
  "Snowshoe",
  "Soccer",
  "StairStepper",
  "StandUpPaddling",
  "Surfing",
  "Swim",
  "Velomobile",
  "VirtualRide",
  "VirtualRun",
  "Walk",
  "WeightTraining",
  "Wheelchair",
  "Windsurf",
  "Workout",
  "Yoga"
]
export type ActivityType = typeof activityTypes[number]

export interface ActivityResponse {
  resource_state: number
  athlete: {
    id: number
    resource_state: number
  }
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  workout_type: any
  id: number
  start_date: string
  start_date_local: string
  timezone: string
  utc_offset: number
  location_city: any
  location_state: any
  location_country: any
  achievement_count: number
  kudos_count: number
  comment_count: number
  athlete_count: number
  photo_count: number
  map: {
    id: string
    summary_polyline: string
    resource_state: number
  }
  trainer: boolean
  commute: boolean
  manual: boolean
  private: boolean
  visibility: string
  flagged: boolean
  gear_id: any
  start_latlng: number[]
  end_latlng: number[]
  average_speed: number
  max_speed: number
  has_heartrate: boolean
  heartrate_opt_out: boolean
  display_hide_heartrate_option: boolean
  elev_high: number
  elev_low: number
  upload_id: number
  upload_id_str: string
  external_id: string
  from_accepted_tag: boolean
  pr_count: number
  total_photo_count: number
  has_kudoed: boolean
}