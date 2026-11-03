// Central API client for LPU Room Shifting

export interface User {
  id: string;
  name: string;
  reg_id: string;
  phone: string;
  hostel: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginPayload {
  identifier: string; // Registration ID or Phone Number
  password: string;
}

export interface RegisterPayload {
  name: string;
  reg_id: string;
  phone: string;
  hostel: string;
  password: string;
}

export interface RoomPhoto {
  id?: string;
  image_url: string;
  public_id?: string | null;
}

export interface RoomListing {
  id: string;
  user_id: string;
  hostel_name: string;
  room_number: string;
  block: string;
  room_type: "AC" | "Non-AC" | string;
  seater: number;
  resident_name: string;
  description?: string | null;
  status?: string;
  created_at?: string;
  owner_name: string;
  owner_phone?: string | null;
  owner_current_hostel?: string | null;
  can_view_contact?: boolean;
  is_owner?: boolean;
  photos: RoomPhoto[];
}

export interface RoomFilters {
  hostel?: string;
  type?: string;
  seater?: number | string;
  block?: string;
}

export interface CreateRoomPayload {
  hostel_name: string;
  room_number: string;
  block: string;
  room_type: string;
  seater: number;
  resident_name?: string;
  floor?: number;
  description?: string;
  photos?: string[] | Array<{ imageUrl: string; publicId?: string | null }>;
}

export interface RoomContactResponse {
  success: boolean;
  contact: {
    owner_name: string;
    phone: string;
    whatsapp_url: string;
  };
}

export interface UploadPhotoResponse {
  success: boolean;
  message: string;
  photos: Array<{
    imageUrl: string;
    publicId: string;
  }>;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || "";

const TOKEN_KEY = "lpu_auth_token";
const USER_KEY = "lpu_auth_user";

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setStoredAuth = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Universal fetch wrapper that attaches Authorization header and credentials
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.error ? (typeof data.error === "string" ? data.error : JSON.stringify(data.error)) : null) ||
      `Request failed with status ${response.status}`;
    const err = new Error(errorMessage) as Error & { status: number; data: unknown };
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const authApi = {
  /**
   * Register a new student account
   * POST /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name.trim(),
        reg_id: payload.reg_id.trim(),
        phone: payload.phone.trim(),
        hostel: payload.hostel.trim(),
        password: payload.password,
      }),
    });

    if (data.token && data.user) {
      setStoredAuth(data.token, data.user);
    }

    return data;
  },

  /**
   * Log in via Registration ID or Phone Number
   * POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const cleanId = payload.identifier.trim();
    // Backend supports either reg_id or phone in body
    const isPhone = /^[0-9]{10}$/.test(cleanId);
    const bodyPayload = isPhone
      ? { phone: cleanId, password: payload.password }
      : { reg_id: cleanId, password: payload.password };

    const data = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(bodyPayload),
    });

    if (data.token && data.user) {
      setStoredAuth(data.token, data.user);
    }

    return data;
  },

  /**
   * Fetch current authenticated user profile
   * GET /api/auth/me
   */
  async getMe(): Promise<{ success: boolean; user: User }> {
    return request<{ success: boolean; user: User }>("/api/auth/me");
  },

  /**
   * Logout user session and clear storage
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await request<{ success: boolean; message: string }>("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Even if network fails, always clear local state
    } finally {
      clearStoredAuth();
    }
  },
};

export const roomApi = {
  /**
   * Search and browse rooms with optional query filters
   * GET /api/rooms?hostel=...&type=...&seater=...&block=...
   */
  async getRooms(filters?: RoomFilters): Promise<{
    success: boolean;
    count: number;
    source: string;
    rooms: RoomListing[];
  }> {
    const params = new URLSearchParams();
    if (filters?.hostel && filters.hostel !== "all") params.append("hostel", filters.hostel);
    if (filters?.type && filters.type !== "all") params.append("type", filters.type);
    if (filters?.seater && filters.seater !== "all") params.append("seater", String(filters.seater));
    if (filters?.block && filters.block !== "all") params.append("block", filters.block);

    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{
      success: boolean;
      count: number;
      source: string;
      rooms: RoomListing[];
    }>(`/api/rooms${query}`);
  },

  /**
   * Get single room details by ID (phone masked if unauthenticated)
   * GET /api/rooms/:id
   */
  async getRoomById(id: string): Promise<{ success: boolean; room: RoomListing }> {
    return request<{ success: boolean; room: RoomListing }>(`/api/rooms/${id}`);
  },

  /**
   * Create a new room listing (Protected)
   * POST /api/rooms
   */
  async createRoom(payload: CreateRoomPayload): Promise<{
    success: boolean;
    message: string;
    room: RoomListing;
  }> {
    return request<{
      success: boolean;
      message: string;
      room: RoomListing;
    }>("/api/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch verified owner contact info & WhatsApp link (Protected)
   * GET /api/rooms/:id/contact
   */
  async getRoomContact(id: string): Promise<RoomContactResponse> {
    return request<RoomContactResponse>(`/api/rooms/${id}/contact`);
  },

  /**
   * Delete room listing (Protected - Owner only)
   * DELETE /api/rooms/:id
   */
  async deleteRoom(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/rooms/${id}`, {
      method: "DELETE",
    });
  },
};

export const uploadApi = {
  /**
   * Upload room photos (multipart/form-data)
   * POST /api/upload/photos
   */
  async uploadPhotos(files: File[]): Promise<UploadPhotoResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });

    return request<UploadPhotoResponse>("/api/upload/photos", {
      method: "POST",
      body: formData,
    });
  },
};

export const systemApi = {
  /**
   * Health check endpoint
   * GET /health
   */
  async checkHealth(): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>("/health");
  },
};

