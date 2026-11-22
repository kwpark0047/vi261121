import type { User } from 'firebase/auth';

/**
 * Admin identity is intentionally kept in one place so the UI, the rules
 * documentation, and the moderation dashboard agree on who is an admin.
 *
 * The Firestore rules remain the security boundary: this module only decides
 * whether to *show* the dashboard entry point. A user who tampers with the
 * client still cannot write moderation data unless the rules' `isAdmin()`
 * check passes.
 */
export const MAIN_ADMIN_EMAIL = 'kwpark0047@gmail.com';
export const SUB_ADMIN_EMAIL = 'kwpark0047@iceu.kr';

export type AdminRole = 'main' | 'sub';

type AdminIdentity = Pick<User, 'email' | 'emailVerified'> | null | undefined;

export function getAdminRole(user: AdminIdentity): AdminRole | null {
  if (!user?.email || !user.emailVerified) return null;
  const email = user.email.trim().toLowerCase();
  if (email === MAIN_ADMIN_EMAIL) return 'main';
  if (email === SUB_ADMIN_EMAIL) return 'sub';
  return null;
}

export function isAdmin(user: AdminIdentity): boolean {
  return getAdminRole(user) !== null;
}
