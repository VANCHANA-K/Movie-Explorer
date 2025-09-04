import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: TmdbGenre[];
  adult: boolean;
  original_language: string;
  popularity: number;
  runtime?: number;
  budget?: number;
  revenue?: number;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { iso_639_1: string; name: string }[];
  tagline?: string;
  homepage?: string;
  status?: string;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdb.baseUrl;
  
  discoverMovies(page = 1, genreId?: number): Observable<TmdbResponse | { error: string }> {
    const params = new URLSearchParams({
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
      language: 'en-US'
    });
    
    if (genreId && genreId > 0) {
      params.set('with_genres', genreId.toString());
    }
    
    const url = `${this.baseUrl}/discover/movie?${params}`;
    
    return this.http.get<TmdbResponse>(url).pipe(
      catchError(error => {
        console.error('TMDB discover error:', error);
        let errorMessage = 'Failed to load movies';
        if (error.status === 401) {
          errorMessage = 'Invalid TMDB API key';
        } else if (error.status === 429) {
          errorMessage = 'Too many requests, please try again later';
        }
        return of({ error: errorMessage });
      })
    );
  }
  
  searchMovies(query: string, page = 1, genreId?: number): Observable<TmdbResponse | { error: string }> {
    // If genre filtering is needed with search, use discover endpoint instead
    if (genreId && genreId > 0) {
      return this.discoverMoviesWithSearch(query, page, genreId);
    }
    
    const params = new URLSearchParams({
      query: encodeURIComponent(query),
      page: page.toString(),
      include_adult: 'false',
      language: 'en-US'
    });
    
    const url = `${this.baseUrl}/search/movie?${params}`;
    
    return this.http.get<TmdbResponse>(url).pipe(
      catchError(error => {
        console.error('TMDB search error:', error);
        let errorMessage = 'Search failed, please try again';
        if (error.status === 401) {
          errorMessage = 'Invalid TMDB API key';
        }
        return of({ error: errorMessage });
      })
    );
  }
  
  private discoverMoviesWithSearch(query: string, page = 1, genreId?: number): Observable<TmdbResponse | { error: string }> {
    // Use discover endpoint with keyword search-like behavior
    const params = new URLSearchParams({
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
      include_video: 'false',
      language: 'en-US'
    });
    
    if (genreId && genreId > 0) {
      params.set('with_genres', genreId.toString());
    }
    
    // Add query as a keyword search - not perfect but workable
    if (query.trim()) {
      params.set('with_keywords', query.trim());
    }
    
    const url = `${this.baseUrl}/discover/movie?${params}`;
    
    return this.http.get<TmdbResponse>(url).pipe(
      map(response => {
        // Client-side filter by title if keyword search doesn't work well
        if (query.trim()) {
          const filteredResults = response.results.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.overview?.toLowerCase().includes(query.toLowerCase())
          );
          return { ...response, results: filteredResults };
        }
        return response;
      }),
      catchError(error => {
        console.error('TMDB discover with search error:', error);
        return of({ error: 'Search failed, please try again' });
      })
    );
  }
  
  getMovieDetails(id: number): Observable<TmdbMovie | { error: string }> {
    const url = `${this.baseUrl}/movie/${id}?language=en-US`;
    
    return this.http.get<TmdbMovie>(url).pipe(
      catchError(error => {
        console.error('TMDB movie details error:', error);
        let errorMessage = 'Failed to load movie details';
        if (error.status === 404) {
          errorMessage = 'Movie not found';
        } else if (error.status === 401) {
          errorMessage = 'Invalid TMDB API key';
        }
        return of({ error: errorMessage });
      })
    );
  }
  
  getGenres(): Observable<{ genres: TmdbGenre[] } | { error: string }> {
    const url = `${this.baseUrl}/genre/movie/list?language=en-US`;
    
    return this.http.get<{ genres: TmdbGenre[] }>(url).pipe(
      catchError(error => {
        console.error('TMDB genres error:', error);
        return of({ error: 'Failed to load genres' });
      })
    );
  }
  
  getPosterUrl(posterPath: string | null): string {
    if (!posterPath) return '/placeholder-poster.jpg';
    return `${environment.tmdb.imgBase}${posterPath}`;
  }
  
  getBackdropUrl(backdropPath: string | null): string {
    if (!backdropPath) return '/placeholder-backdrop.jpg';
    return `https://image.tmdb.org/t/p/w780${backdropPath}`;
  }
}
