const isSuperAdmin = userEmail
  ? (userEmail.trim().toLowerCase() === 'ja024478@gmail.com' || userEmail.endsWith('@yourdomain.com'))
  : false;

export default isSuperAdmin;
