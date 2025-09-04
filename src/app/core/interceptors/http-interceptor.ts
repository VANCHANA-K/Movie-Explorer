import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(environment.omdb.baseUrl)) {
    const url = new URL(req.url);
    url.searchParams.set('apikey', environment.omdb.apiKey);
    return next(req.clone({ url: url.toString() }));
  }
  
  if (req.url.startsWith(environment.tmdb.baseUrl)) {
    const modifiedReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${environment.tmdb.apiKey}`
      }
    });
    return next(modifiedReq);
  }
  
  return next(req);
};
