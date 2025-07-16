// Predefined color palette for avatars
const AVATAR_COLORS = [
  { bg: '3b82f6', text: 'ffffff' }, // Blue
  { bg: '10b981', text: 'ffffff' }, // Green
  { bg: 'f59e0b', text: 'ffffff' }, // Amber
  { bg: 'ef4444', text: 'ffffff' }, // Red
  { bg: '8b5cf6', text: 'ffffff' }, // Purple
  { bg: 'f97316', text: 'ffffff' }, // Orange
  { bg: '06b6d4', text: 'ffffff' }, // Cyan
  { bg: 'ec4899', text: 'ffffff' }, // Pink
  { bg: '84cc16', text: 'ffffff' }, // Lime
  { bg: '6366f1', text: 'ffffff' }, // Indigo
  { bg: 'f43f5e', text: 'ffffff' }, // Rose
  { bg: '14b8a6', text: 'ffffff' }, // Teal
];

/**
 * Generate initials from a full name
 * @param name - Full name (e.g., "John Doe")
 * @returns Initials (e.g., "JD")
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'NA'; // Default initials for null/undefined names
  }
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2) // Take first 2 initials only
    .join('');
}

/**
 * Generate a consistent color based on the name
 * @param name - Full name
 * @returns Color object with background and text colors
 */
function getColorForName(name: string): { bg: string; text: string } {
  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Generate avatar URL using UI Avatars service
 * @param name - Full name
 * @param size - Avatar size (default: 40)
 * @returns Avatar URL
 */
export function generateAvatarUrl(name: string, size: number = 40): string {
  const safeName = name || 'Unknown User';
  const initials = getInitials(safeName);
  const colors = getColorForName(safeName);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors.bg}&color=${colors.text}&size=${size}&bold=true&format=png`;
}

/**
 * Generate avatar for React component (includes alt text)
 * @param name - Full name
 * @param size - Avatar size (default: 40)
 * @returns Avatar object with src and alt
 */
export function generateAvatar(name: string, size: number = 40) {
  return {
    src: generateAvatarUrl(name, size),
    alt: `${name} avatar`,
    initials: getInitials(name)
  };
} 