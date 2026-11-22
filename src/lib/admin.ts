import type { User } from 'firebase/auth';

export type AdminRole = 'main' | 'sub' | null;

/**
 * Returns the admin role for a user based on their email.
 * - 'main' if email matches MAIN_ADMIN_EMAIL and emailVerified is true
 * - 'sub' if email matches SUB_ADMIN_EMAIL and emailVerified is true
 * - null otherwise (including unverified emails)
 *
 * UI should only use this for display/logic; Firestore rules
 * represent the final security boundary.
 */
export function getAdminRole(
  user: Pick<User, 'email' | 'emailVerified'> | null | undefined,
): AdminRole {
  if (!user?.email) return null;

  const MAIN_ADMIN_EMAIL = 'kwpark0047@gmail.com';
  const SUB_ADMIN_EMAIL = 'kwpark0047@iceu.kr';

  const isEmailVerified = !!user.emailVerified;
  if (!isEmailVerified) return null;

  const email = user.email.toLowerCase();
  if (email === MAIN_ADMIN_EMAIL.toLowerCase()) return 'main';
  if (email === SUB_ADMIN_EMAIL.toLowerCase()) return 'sub';
  return null;
}

/**
 * Convenient wrapper: true only for verified main or sub admins.
 */
export function isAdmin(user: Pick<User, 'email' | 'emailVerified'> | null | undefined): boolean {
  return getAdminRole(user) !== null;
}

/**
 * Extracts the human-readable role label for UI display.
 * Caller must ensure `role` is not `null` (use `getAdminRole` check first).
 */
export function getAdminLabel(role: 'main' | 'sub', language: 'ko' | 'en'): string {
  const koLabels: Record<'main' | 'sub', string> = {
    main: '메인 관리자',
    sub: '서브 관리자',
  };
  const enLabels: Record<'main' | 'sub', string> = {
    main: 'Main Admin',
    sub: 'Sub Admin',
  };
  return language === 'ko' ? koLabels[role] ?? '알 수 없음' : enLabels[role] ?? 'Unknown';
}