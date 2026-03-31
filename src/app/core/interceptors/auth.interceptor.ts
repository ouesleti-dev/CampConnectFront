import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/** Ajoute le JWT pour toute requête vers l’API Campconnect (context-path /campconnect). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return next(req);
  }
  const apiRoot = environment.apiUrl.replace(/\/$/, '');
  const urlNoQuery = req.url.split('?')[0];
  const forThisBackend =
    urlNoQuery === apiRoot ||
    urlNoQuery.startsWith(apiRoot + '/') ||
    urlNoQuery.includes('/campconnect/api/');
  if (forThisBackend) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
