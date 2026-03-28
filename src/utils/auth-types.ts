/**
 * User database record
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

/**
 * Credential database record (encrypted)
 */
export interface Credential {
  id: number;
  user_id: number;
  platform: 'bluesky' | 'mastodon';
  handle: string;
  token_encrypted: string;
  created_at: string;
  updated_at: string;
}

/**
 * User object returned to frontend (no password hash)
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

/**
 * Credential object with decrypted token
 */
export interface CredentialDecrypted {
  id: number;
  platform: 'bluesky' | 'mastodon';
  handle: string;
  token: string; // Decrypted
  created_at: string;
}

/**
 * Sign up request body
 */
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Login request body
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Auth response with token
 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}

/**
 * Add credential request body
 */
export interface AddCredentialRequest {
  platform: 'bluesky' | 'mastodon';
  handle: string;
  token: string; // Will be encrypted before storage
}
