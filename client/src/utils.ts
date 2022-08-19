import { Profile } from './types/api';

export const truncateText = (text: string, length: number) =>
  text.length > length ? `${text.substring(0, length)}...` : text;

export const otherClientType = (type: Profile['type']) => (type === 'client' ? 'Contractor' : 'Client');

export const getFullName = (profile: Profile) => `${profile.firstName} ${profile.lastName}`;
