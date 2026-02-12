export interface TimeSectionPlace {
  id: string;
  place_name: string;
  category: string;
  start_time: number;
  end_time: number;
  address: string;
  url: string;
  place_icon_css_class: string;
}

export interface TravelPlan {
  id: string;
  places: TimeSectionPlace[];
  saved: boolean;
  planning_spec: string;
}

export interface PlanningResponse {
  travel_destination: string;
  travel_plans: TravelPlan[];
  trip_details_url: string[];
  error: string | null;
  status_code: number;
}

export interface PlaceDetails {
  id: string;
  name: string;
  url: string;
  formatted_address: string;
  photo_url: string;
  summary: string;
}

export interface TripDetailResponse {
  original_plan_id: string;
  lat_longs: [number, number][];
  place_categories: string[];
  place_details: PlaceDetails[];
  shown_active: boolean[];
  travel_destination: string;
  travel_date: string;
  score: number;
  score_old: number;
}

export interface UserLoginResponse {
  email: string;
  username: string;
  jwt: string;
  status: string;
}

export interface TravelPlaceView {
  id: string;
  time_period: string;
  place_name: string;
  address: string;
  url: string;
}

export interface TravelPlanView {
  id: string;
  original_plan_id: string;
  created_at: string;
  travel_date: string;
  destination: string;
  places: TravelPlaceView[];
}

export interface CityView {
  city: string;
  region: string;
  country: string;
}

export interface Favorites {
  most_frequent_search: string;
}

export interface ReverseGeocodeResult {
  city: string;
  admin_area_level_one: string;
  country: string;
}

export interface UserProfile {
  username: string;
  email: string;
  user_level: string;
}

export interface SearchParams {
  location: string;
  date: string;
  price: string;
  numberResults?: number;
  precise?: boolean;
  nearby?: boolean;
}
