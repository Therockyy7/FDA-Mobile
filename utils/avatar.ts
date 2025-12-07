/**
 * Get the initial letter for avatar from email or name
 */
export function getAvatarInitial(emailOrName?: string | null): string {
  if (!emailOrName) return "U";
  
  // If it's an email, get the part before @
  if (emailOrName.includes("@")) {
    return emailOrName.charAt(0).toUpperCase();
  }
  
  // If it's a name, get the first letter
  return emailOrName.charAt(0).toUpperCase();
}