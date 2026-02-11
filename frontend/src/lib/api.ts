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
} from "@/types/api";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("JWT");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export async function login(email: string, password: string) {
  const { data } = await api.post<UserLoginResponse>("/login", {
    email,
    password,
  });
  if (data.jwt) {
    Cookies.set("JWT", data.jwt, { path: "/", secure: true, sameSite: "lax" });
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
  const { data } = await api.get<PlanningResponse>("/plans", { params });
  return data;
}

export async function getPlanDetails(id: string, date?: string) {
  const { data } = await api.get<TripDetailResponse>(`/plans/${id}`, {
    params: { date },
  });
  return data;
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
  const { data } = await api.get("/reverse-geocoding", {
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
  const { data } = await api.get<TripDetailResponse>(
    `/users/plan/${planId}`
  );
  return data;
}

// --- Favorites ---
export async function getUserFavorites(username: string) {
  const { data } = await api.get(`/users/${username}/favorites`);
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
