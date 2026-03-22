/**
 * Public API des Social-Feature-Moduls
 */

// Types
export type {
  PublicProfile,
  ProfileUpdatePayload,
  UsernameCheckResult,
  ProfileFormState,
} from './types/profile.types';

// Services
export {
  updateProfile,
  checkUsernameAvailability,
  getPublicProfile,
  searchUsers,
} from './services/profileService';
export {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from './services/followService';

// Hooks
export { useProfile } from './hooks/useProfile';
export { usePublicProfile } from './hooks/usePublicProfile';
export { useUsernameCheck } from './hooks/useUsernameCheck';
export { useFollow } from './hooks/useFollow';
export { useFollowers, useFollowing } from './hooks/useFollowList';
export { useSearch } from './hooks/useSearch';

// Components
export { ProfileHeader } from './components/ProfileHeader';
export { ProfileForm } from './components/ProfileForm';
export { AvatarPicker } from './components/AvatarPicker';
export { UsernameInput } from './components/UsernameInput';
export { FollowButton } from './components/FollowButton';
export { UserCard } from './components/UserCard';
export { SearchBar } from './components/SearchBar';
export { EmptySearchState } from './components/EmptySearchState';
