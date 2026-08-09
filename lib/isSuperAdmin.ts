export default function isSuperAdminEmail(userEmail?: string | null) {
  if (!userEmail) return false;
  const e = userEmail.trim().toLowerCase();
  return e === 'ja024478@gmail.com' || e.endsWith('@yourdomain.com');
}
