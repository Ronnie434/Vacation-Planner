import axios from "axios";
import Cookies from "js-cookie";
import type {
  PlanningResponse,
  TripDetailResponse,
  UserLoginResponse,
  TravelPlanView,
  SearchParams,
  UserProfile,
  CityView,
  Favorites,
  ReverseGeocodeResult,
} from "@/types/api";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- Auth ---
export async function login(email: string, password: string) {
  const { data } = await api.post<UserLoginResponse>("/login", {
    email,
    password,
  });
  if (data.jwt) {
    const isSecure = window.location.protocol === "https:";
    Cookies.set("JWT", data.jwt, { path: "/", secure: isSecure, sameSite: "lax" });
  }
  return data;
}

export async function signup(
  username: string,
  email: string,
  password: string
) {
  const { data } = await api.post<{ message: string }>("/signup", {
    username,
    email,
    password,
  });
  return data;
}

export async function getMe() {
  const { data } = await api.get<UserProfile>("/me");
  return data;
}

export function loginWithGoogle() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
  window.location.href = `${apiUrl}/v1/login-google`;
}

export async function sendPasswordResetEmail(email: string) {
  const { data } = await api.get("/send-password-reset-email", {
    params: { email },
  });
  return data;
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  const { data } = await api.put("/reset-password-backend", {
    email,
    code,
    new_password: newPassword,
  });
  return data;
}

// --- Plans ---
export async function getPlans(params: SearchParams) {
  const { data } = await api.get<PlanningResponse>("/plans", {
    params: { ...params, json_only: true },
  });
  return data;
}

// Backend TripDetailResp/PlaceDetailsResp lack JSON tags, so fields come back
// as PascalCase. This normalizer handles both formats for compatibility.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTripDetail(data: any): TripDetailResponse {
  return {
    original_plan_id: data.original_plan_id ?? data.OriginalPlanID,
    lat_longs: data.lat_longs ?? data.LatLongs,
    place_categories: data.place_categories ?? data.PlaceCategories,
    place_details: (data.place_details ?? data.PlaceDetails)?.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => ({
        id: p.id ?? p.ID,
        name: p.name ?? p.Name,
        url: p.url ?? p.URL,
        formatted_address: p.formatted_address ?? p.FormattedAddress,
        photo_url: p.photo_url ?? p.PhotoURL,
        summary: p.summary ?? p.Summary,
      })
    ),
    shown_active: data.shown_active ?? data.ShownActive,
    travel_destination: data.travel_destination ?? data.TravelDestination,
    travel_date: data.travel_date ?? data.TravelDate,
    score: data.score ?? data.Score,
    score_old: data.score_old ?? data.ScoreOld,
  };
}

export async function getPlanDetails(id: string, date?: string) {
  const { data } = await api.get(`/plans/${id}`, {
    params: { date, json_only: true },
  });
  return normalizeTripDetail(data);
}

// --- Cities ---
export async function searchCities(term: string) {
  const { data } = await api.get<{ results: CityView[] }>("/cities", {
    params: { term },
  });
  return data.results;
}

// --- Reverse Geocoding ---
export async function reverseGeocode(lat: number, lng: number) {
  const { data } = await api.get<{ results: ReverseGeocodeResult }>("/reverse-geocoding", {
    params: { lat, lng },
  });
  return data.results;
}

// --- Customization ---
export async function customizePlan(
  planData: object,
  date: string,
  price: string,
  size: number
) {
  const { data } = await api.post<PlanningResponse>(
    `/customize?date=${date}&price=${price}&size=${size}`,
    planData
  );
  return data;
}

// --- User Plans ---
export async function getUserPlans(username: string) {
  const { data } = await api.get<{ travel_plans: TravelPlanView[] }>(
    `/users/${username}/plans`
  );
  return data.travel_plans;
}

export async function savePlan(username: string, plan: object) {
  const { data } = await api.post(`/users/${username}/plans`, plan);
  return data;
}

export async function deletePlan(username: string, planId: string) {
  const { data } = await api.delete(`/users/${username}/plan/${planId}`);
  return data;
}

export async function getUserSavedPlanDetails(planId: string) {
  const { data } = await api.get(
    `/users/plan/${planId}`,
    { params: { json_only: true } }
  );
  return normalizeTripDetail(data);
}

// --- Favorites ---
export async function getUserFavorites(username: string) {
  const { data } = await api.get<Favorites>(`/users/${username}/favorites`);
  return data;
}

// --- Feedback ---
export async function submitFeedback(username: string, feedback: object) {
  const { data } = await api.post(`/users/${username}/feedback`, feedback);
  return data;
}

// --- Images ---
export async function generateLocationImage(
  city: string,
  adminArea: string,
  country: string
) {
  const { data } = await api.post("/gen_image", {
    city,
    adminAreaLevelOne: adminArea,
    country,
  });
  return data;
}

// --- Plan Summary ---
export async function getPlanSummary(planId: string) {
  const { data } = await api.post<{ message: string }>("/plan-summary", {
    plan_id: planId,
  });
  return data;
}

// --- Nearby Cities ---
export async function getNearbyCities(requestData: object) {
  const { data } = await api.post("/nearby-cities", requestData);
  return data;
}

export default api;
