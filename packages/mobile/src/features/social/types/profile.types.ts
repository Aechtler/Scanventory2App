/**
 * Typen für User-Profile und Social-Features
 */

/** Öffentliches Profil — wie es vom Backend zurückkommt */
export interface PublicProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  followerCount: number;
  followingCount: number;
  /** Nur gesetzt wenn der eigene User eingeloggt ist und ein fremdes Profil ansieht */
  isFollowing?: boolean;
}

/** Payload zum Bearbeiten des eigenen Profils */
export interface ProfileUpdatePayload {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic?: boolean;
}

/** Ergebnis des Username-Verfügbarkeits-Check */
export interface UsernameCheckResult {
  available: boolean;
  reason?: string;
}

/** Lokaler Formular-State für Profil-Bearbeitung */
export interface ProfileFormState {
  username: string;
  displayName: string;
  bio: string;
  isPublic: boolean;
}
