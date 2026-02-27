// C:\Users\vikas\dating-webapp\front-end\src\services\profileService.ts
import { OnboardingData } from '../components/onboarding/OnboardingFlow';

const API_BASE = import.meta.env.VITE_API_BASE;

const API_BASE_URL = `${API_BASE}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  console.log('[profileService] Token present:', !!token);
  if (token) {
    console.log('[profileService] Token preview:', token.substring(0, 20) + '...');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Normalize interestedIn values to match backend valid options: "Men", "Women", "Everyone"
const normalizeInterestedIn = (values: string[]): string[] => {
  const map: Record<string, string> = {
    'man':      'Men',
    'men':      'Men',
    'male':     'Men',
    'woman':    'Women',
    'women':    'Women',
    'female':   'Women',
    'everyone': 'Everyone',
    'all':      'Everyone',
    'both':     'Everyone',
  };
  return values.map(v => map[v.toLowerCase()] ?? v);
};

// Convert OnboardingData to API format
const formatProfileData = (data: OnboardingData) => {
  const formatted = {
    first_name: data.firstName,
    date_of_birth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : null,
    gender: data.gender,
    show_gender: data.showGender,
    interested_in: normalizeInterestedIn(data.interestedIn || []),
    relationship_type: data.relationshipType,
    distance: data.distance,
    strict_distance: data.strictDistance,
    drinking: data.drinking,
    smoking: data.smoking,
    workout: data.workout,
    pets: data.pets,
    communication_style: data.communicationStyle,
    response_pace: data.responsePace,
    interests: data.interests,
    location: data.location,
    use_current_location: data.useCurrentLocation,
    bio: data.bio,
    social_accounts: data.socialAccounts || {},
  };

  console.log('[profileService] Formatted data for API:', formatted);
  console.log('[profileService] Social accounts being sent:', formatted.social_accounts);
  return formatted;
};

// Subscription info parsed from the same profile response
export interface SubscriptionInfo {
  isPremium: boolean;
  planName: string | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
  daysRemaining: number;
  isActive: boolean;
}

export const parseSubscriptionInfo = (apiData: any): SubscriptionInfo => {
  const raw = apiData.profile || apiData; // handle both wrapped and flat responses
  const isPremium = raw.premium === true;
  const planName = raw.premium_plan || null;
  const activatedAt = raw.premium_activated_at ? new Date(raw.premium_activated_at) : null;
  const expiresAt = raw.premium_expires_at ? new Date(raw.premium_expires_at) : null;

  let daysRemaining = 0;
  let isActive = false;

  if (isPremium && expiresAt) {
    const msRemaining = expiresAt.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    isActive = msRemaining > 0;
  } else if (isPremium && !expiresAt) {
    // Lifetime / no expiry set
    isActive = true;
    daysRemaining = Infinity;
  }

  return { isPremium, planName, activatedAt, expiresAt, daysRemaining, isActive };
};

// Convert API response to OnboardingData format
const parseProfileData = (apiData: any): OnboardingData => {
  console.log('[profileService] Parsing API data:', apiData);
  console.log('[profileService] API Keys:', Object.keys(apiData));

  const getField = (snakeCase: string, camelCase: string, defaultValue: any = '') => {
    const snakeValue = apiData[snakeCase];
    const camelValue = apiData[camelCase];
    if (snakeValue !== undefined && snakeValue !== null && snakeValue !== '') return snakeValue;
    if (camelValue !== undefined && camelValue !== null && camelValue !== '') return camelValue;
    return defaultValue;
  };

  const getArrayField = (snakeCase: string, camelCase: string) => {
    const snakeValue = apiData[snakeCase];
    const camelValue = apiData[camelCase];
    if (Array.isArray(snakeValue) && snakeValue.length > 0) return snakeValue;
    if (Array.isArray(camelValue) && camelValue.length > 0) return camelValue;
    return [];
  };

  const getBooleanField = (snakeCase: string, camelCase: string, defaultValue: boolean) => {
    const snakeValue = apiData[snakeCase];
    const camelValue = apiData[camelCase];
    if (snakeValue !== undefined && snakeValue !== null) return snakeValue;
    if (camelValue !== undefined && camelValue !== null) return camelValue;
    return defaultValue;
  };

  const getDateField = (snakeCase: string, camelCase: string) => {
    const snakeValue = apiData[snakeCase];
    const camelValue = apiData[camelCase];
    const dateValue = snakeValue || camelValue;
    return dateValue ? new Date(dateValue) : null;
  };

  const getObjectField = (snakeCase: string, camelCase: string, defaultValue: any = {}) => {
    const snakeValue = apiData[snakeCase];
    const camelValue = apiData[camelCase];
    if (snakeValue && typeof snakeValue === 'object' && Object.keys(snakeValue).length > 0) return snakeValue;
    if (camelValue && typeof camelValue === 'object' && Object.keys(camelValue).length > 0) return camelValue;
    return defaultValue;
  };

  const parsed: OnboardingData = {
    firstName: getField('first_name', 'firstName', ''),
    dateOfBirth: getDateField('date_of_birth', 'dateOfBirth'),
    gender: getField('gender', 'gender', ''),
    showGender: getBooleanField('show_gender', 'showGender', true),
    interestedIn: getArrayField('interested_in', 'interestedIn'),
    relationshipType: getField('relationship_type', 'relationshipType', ''),
    distance: apiData.distance || 25,
    strictDistance: getBooleanField('strict_distance', 'strictDistance', false),
    drinking: getField('drinking', 'drinking', ''),
    smoking: getField('smoking', 'smoking', ''),
    workout: getField('workout', 'workout', ''),
    pets: getField('pets', 'pets', ''),
    communicationStyle: getArrayField('communication_style', 'communicationStyle'),
    responsePace: getField('response_pace', 'responsePace', ''),
    interests: getArrayField('interests', 'interests'),
    location: getField('location', 'location', ''),
    useCurrentLocation: getBooleanField('use_current_location', 'useCurrentLocation', false),
    photos: [], // photos upload removed; always empty
    bio: getField('bio', 'bio', ''),
    socialAccounts: getObjectField('social_accounts', 'socialAccounts', {
      instagram: '',
      whatsapp: '',
      snapchat: '',
      twitter: '',
      linkedin: '',
    }),
  };

  console.log('[profileService] Parsed data:', parsed);
  console.log('[profileService] Social accounts parsed:', parsed.socialAccounts);
  console.log('[profileService] Debug values:', {
    firstName: { snake: apiData.first_name, camel: apiData.firstName, result: parsed.firstName },
    relationshipType: { snake: apiData.relationship_type, camel: apiData.relationshipType, result: parsed.relationshipType },
    interestedIn: { snake: apiData.interested_in, result: parsed.interestedIn },
    socialAccounts: { snake: apiData.social_accounts, result: parsed.socialAccounts },
  });
  return parsed;
};

export const profileService = {
  async getProfile() {
    console.log('[profileService] GET /api/profile/');
    try {
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('[profileService] Response status:', response.status);
      console.log('[profileService] Response ok:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[profileService] Profile not found (404)');
          return { exists: false, data: null };
        }
        const errorText = await response.text();
        console.error('[profileService] Error response:', errorText);
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      console.log('[profileService] Raw API response:', data);

      const profileData = data.profile || data;
      console.log('[profileService] Profile data to parse:', profileData);

      return {
        exists: true,
        data: parseProfileData(profileData),
        subscription: parseSubscriptionInfo(profileData),
      };
    } catch (error) {
      console.error('[profileService] Error in getProfile:', error);
      throw error;
    }
  },

  async saveProfile(profileData: OnboardingData) {
    console.log('[profileService] SAVE PROFILE');
    console.log('[profileService] Input data:', profileData);
    console.log('[profileService] Social accounts input:', profileData.socialAccounts);

    try {
      const formattedData = formatProfileData(profileData);

      console.log('[profileService] POST /api/profile/save/');
      console.log('[profileService] Sending body:', JSON.stringify(formattedData, null, 2));

      const response = await fetch(`${API_BASE_URL}/profile/save/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formattedData),
      });

      console.log('[profileService] Response status:', response.status);
      console.log('[profileService] Response ok:', response.ok);

      const responseText = await response.text();
      console.log('[profileService] Raw response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { detail: responseText };
        }
        console.error('[profileService] Error data:', errorData);
        throw new Error(errorData.detail || 'Failed to save profile');
      }

      const data = JSON.parse(responseText);
      console.log('[profileService] Success response:', data);
      return { success: true, profile: parseProfileData(data.profile) };
    } catch (error) {
      console.error('[profileService] Error in saveProfile:', error);
      throw error;
    }
  },

  async updateProfile(partialData: Partial<OnboardingData>) {
    console.log('[profileService] UPDATE PROFILE (PARTIAL)');
    console.log('[profileService] Partial data:', partialData);

    try {
      const formattedData = formatProfileData(partialData as OnboardingData);

      const response = await fetch(`${API_BASE_URL}/profile/save/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[profileService] Update error:', errorText);
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      return { success: true, profile: parseProfileData(data.profile) };
    } catch (error) {
      console.error('[profileService] Error updating profile:', error);
      throw error;
    }
  },

  async checkProfileStatus() {
    console.log('[profileService] CHECK PROFILE STATUS');

    try {
      const response = await fetch(`${API_BASE_URL}/profile/status/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to check profile status');
      }

      const data = await response.json();
      console.log('[profileService] Profile status:', data);

      return {
        exists: data.profile_exists,
        complete: data.profile_complete,
        profile: data.profile ? parseProfileData(data.profile) : null,
      };
    } catch (error) {
      console.error('[profileService] Error checking profile status:', error);
      throw error;
    }
  },
};

// Admin Service - Token-based auth for Django superusers
export const adminService = {
  async adminLogin(username: string, password: string) {
    console.log('[adminService] Admin login attempt');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));

      console.log('[adminService] Login successful:', data.user.username);
      return data;
    } catch (error) {
      console.error('[adminService] Login error:', error);
      throw error;
    }
  },

  adminLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getAdminHeaders() {
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    };
  },

  isAdmin() {
    const user = localStorage.getItem('admin_user');
    if (!user) return false;
    try {
      const userData = JSON.parse(user);
      return userData.is_staff === true;
    } catch {
      return false;
    }
  },

  getAdminUser() {
    const user = localStorage.getItem('admin_user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  async adminApiCall<T>(endpoint: string, method: string = 'GET', data: any = null): Promise<T> {
    const options: RequestInit = {
      method,
      headers: this.getAdminHeaders(),
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, options);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('[adminService] API error:', error);
      throw error;
    }
  },
};