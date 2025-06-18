import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRoleBasedRedirect } from '@/lib/utils/role-redirect';

// Définir les routes protégées et leurs rôles autorisés
const protectedRoutes = {
  '/super-admin': ['SUPER_ADMIN'],
  '/admin': ['ADMIN'],
  '/medecin': ['MEDECIN'],
  '/receptionniste': ['RECEPTIONNISTE'],
  '/radiologue': ['RADIOLOGUE'],
  '/technicien': ['TECHNICIEN'],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const user = request.cookies.get('user');
  const pathname = request.nextUrl.pathname;

  // Vérifier si c'est une page d'authentification
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // Si pas de token ou d'utilisateur et pas sur une page d'authentification
  if ((!token || !user) && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }



  // Si token et utilisateur existent et sur une page d'authentification
  if (token && user && isAuthPage) {
    try {
      const userData = JSON.parse(user.value);
      const redirectPath = getRoleBasedRedirect(userData.role);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch (error) {
      console.error('Error parsing user data:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Vérifier les routes protégées (du plus long au plus court)
  const sortedRoutes = Object.keys(protectedRoutes).sort((a, b) => b.length - a.length) as (keyof typeof protectedRoutes)[];
  console.log(sortedRoutes);
  for (const route of sortedRoutes) {
    const allowedRoles = protectedRoutes[route];
    if (pathname.startsWith(route)) {
      if (!token || !user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      try {
        const userData = JSON.parse(user.value);
        // DEBUG LOG
        // console.log('userData', userData);
        if (!allowedRoles.includes(userData.role)) {
          // Rediriger vers la page appropriée pour le rôle de l'utilisateur
          const redirectPath = getRoleBasedRedirect(userData.role);
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
        // Si le rôle est autorisé, on laisse passer (pas de redirection)
        break;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 