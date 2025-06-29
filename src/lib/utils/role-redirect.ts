export const getRoleBasedRedirect = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'ADMINISTRATEUR':
      return '/admin';
    case 'MEDECIN':
      return '/medecin';
    case 'RECEPTIONNISTE':
      return '/receptionniste';
    case 'RADIOLOGUE':
      return '/radiologue';
    default:
      return '/dashboard';
  }
}; 