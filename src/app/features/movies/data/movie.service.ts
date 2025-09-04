import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Movie } from './movie.model';
import { MOVIES_MOCK } from './movies.mock';
import { environment } from '../../../../environments/environment';
import { catchError, map, of, throwError } from 'rxjs';

interface OmdbSearchResp {
  Search?: Array<{ imdbID: string; Title: string; Year: string; Poster: string; }>;
  Response: 'True' | 'False';
  Error?: string;
  totalResults?: string;
}

interface OmdbByIdResp {
  imdbID: string;
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  Response: string;
}

export interface SearchResult {
  movies: Movie[];
  error?: string;
}

export interface MovieResult {
  movie?: Movie;
  error?: string;
}

const FAV_KEY = 'movie_explorer_favs';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private movies: Movie[] = MOVIES_MOCK;
  private http = inject(HttpClient);

  // ---- Favorites state (ids) ----
  favorites = signal<string[]>(loadFavs());

  getAll(): Movie[] {
    return [...this.movies];
  }

  getById(id: string): Movie | undefined {
    return this.movies.find(m => m.id === id);
  }

  getAllGenres(): string[] {
    const set = new Set<string>();
    for (const m of this.movies) m.genres.forEach(g => set.add(g));
    return Array.from(set).sort();
  }

  filterMovies(opts: { genre?: string; q?: string }): Movie[] {
    const { genre, q } = opts;
    let list = this.getAll();

    if (genre && genre !== 'All') {
      list = list.filter(m => m.genres.includes(genre));
    }
    if (q && q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(k) ||
        m.overview.toLowerCase().includes(k)
      );
    }
    return list;
  }

  // ---- Favorites helpers ----
  isFavorite(id: string): boolean {
    return this.favorites().includes(id);
  }

  toggleFavorite(id: string) {
    const set = new Set(this.favorites());
    set.has(id) ? set.delete(id) : set.add(id);
    const next = Array.from(set);
    this.favorites.set(next);
    saveFavs(next);
  }

  getFavoriteMovies(): Movie[] {
    const fav = new Set(this.favorites());
    return this.getAll().filter(m => fav.has(m.id));
  }

  // ---- ONLINE (OMDb) ----
  searchOnline(q: string) {
    if (!q?.trim()) return of<SearchResult>({ movies: [] });
    const url = `${environment.omdb.baseUrl}?s=${encodeURIComponent(q)}&type=movie`;
    return this.http.get<OmdbSearchResp>(url).pipe(
      map(res => {
        if (res.Response === 'True' && res.Search) {
          const movies = res.Search.map(r => ({
            id: r.imdbID,
            title: r.Title,
            year: Number(r.Year) || 0,
            genres: [],
            poster: r.Poster !== 'N/A' ? r.Poster : 'assets/placeholder.jpg',
            rating: 0,
            runtimeMin: 0,
            overview: ''
          } as Movie));
          return { movies };
        } else {
          return { movies: [], error: res.Error || 'No results found' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'เครือข่ายมีปัญหา กรุณาลองใหม่อีกครั้ง';
        
        if (error.status === 401) {
          errorMessage = 'API Key ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า';
        } else if (error.status === 0) {
          errorMessage = 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        } else if (error.status >= 500) {
          errorMessage = 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง';
        }
        
        console.error('OMDb API Error:', error);
        return of<SearchResult>({ movies: [], error: errorMessage });
      })
    );
  }

  getByIdOnline(id: string) {
    const url = `${environment.omdb.baseUrl}?i=${encodeURIComponent(id)}&plot=full`;
    return this.http.get<OmdbByIdResp>(url).pipe(
      map(r => {
        if (r.Response === 'True') {
          const movie = {
            id: r.imdbID,
            title: r.Title,
            year: Number(r.Year) || 0,
            genres: r.Genre ? r.Genre.split(',').map(s => s.trim()) : [],
            poster: r.Poster !== 'N/A' ? r.Poster : 'assets/placeholder.jpg',
            rating: Number(r.imdbRating) || 0,
            runtimeMin: Number((r.Runtime || '0').split(' ')[0]) || 0,
            overview: r.Plot || ''
          } as Movie;
          return { movie };
        } else {
          return { error: 'ไม่พบข้อมูลหนังเรื่องนี้' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'เครือข่ายมีปัญหา กรุณาลองใหม่อีกครั้ง';
        
        if (error.status === 401) {
          errorMessage = 'API Key ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า';
        } else if (error.status === 0) {
          errorMessage = 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        } else if (error.status >= 500) {
          errorMessage = 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง';
        }
        
        console.error('OMDb API Error:', error);
        return of<MovieResult>({ error: errorMessage });
      })
    );
  }
}

// LocalStorage helpers
function loadFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFavs(arr: string[]) {
  localStorage.setItem(FAV_KEY, JSON.stringify(arr));
}
