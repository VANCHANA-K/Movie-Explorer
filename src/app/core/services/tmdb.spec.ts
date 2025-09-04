import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TmdbService, TmdbMovie, TmdbGenre } from './tmdb';
import { environment } from '../../../environments/environment';

describe('TmdbService', () => {
  let svc: TmdbService;
  let http: HttpTestingController;

  const mockTmdbMovie: TmdbMovie = {
    id: 603,
    title: 'The Matrix',
    poster_path: '/abc.jpg',
    backdrop_path: '/backdrop.jpg',
    overview: 'A computer hacker learns from mysterious rebels...',
    release_date: '1999-03-31',
    vote_average: 8.7,
    vote_count: 15000,
    genre_ids: [28, 878],
    genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Science Fiction' }],
    adult: false,
    original_language: 'en',
    popularity: 50.5,
    runtime: 136,
    budget: 63000000,
    revenue: 463517383
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ 
      imports: [HttpClientTestingModule]
    });
    svc = TestBed.inject(TmdbService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  it('discoverMovies should fetch popular movies', () => {
    svc.discoverMovies(1).subscribe(response => {
      if ('error' in response) {
        fail('Expected successful response');
        return;
      }
      expect(response.results.length).toBe(1);
      expect(response.results[0].id).toBe(603);
      expect(response.results[0].title).toBe('The Matrix');
      expect(response.page).toBe(1);
      expect(response.total_pages).toBe(10);
    });

    const req = http.expectOne(r => 
      r.url.startsWith(`${environment.tmdb.baseUrl}/discover/movie`) &&
      r.method === 'GET'
    );
    expect(req.request.url).toContain('sort_by=popularity.desc');
    expect(req.request.url).toContain('include_adult=false');
    
    req.flush({
      page: 1,
      total_pages: 10,
      total_results: 200,
      results: [mockTmdbMovie]
    });
  });

  it('discoverMovies should include genre filter', () => {
    svc.discoverMovies(1, 28).subscribe();

    const req = http.expectOne(r => r.url.includes('with_genres=28'));
    req.flush({ page: 1, total_pages: 5, total_results: 100, results: [] });
  });

  it('searchMovies should search by query', () => {
    svc.searchMovies('matrix', 1).subscribe(response => {
      if ('error' in response) {
        fail('Expected successful response');
        return;
      }
      expect(response.results[0].title).toBe('The Matrix');
    });

    const req = http.expectOne(r => 
      r.url.startsWith(`${environment.tmdb.baseUrl}/search/movie`) &&
      r.url.includes('query=matrix')
    );
    
    req.flush({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [mockTmdbMovie]
    });
  });

  it('searchMovies should use discover for genre + search', () => {
    svc.searchMovies('matrix', 1, 28).subscribe();

    // Should use discover endpoint when genre is specified
    const req = http.expectOne(r => 
      r.url.startsWith(`${environment.tmdb.baseUrl}/discover/movie`)
    );
    expect(req.request.url).toContain('with_genres=28');
    
    req.flush({ page: 1, total_pages: 1, total_results: 0, results: [] });
  });

  it('getMovieDetails should fetch movie details', () => {
    svc.getMovieDetails(603).subscribe(response => {
      if ('error' in response) {
        fail('Expected successful response');
        return;
      }
      expect(response.id).toBe(603);
      expect(response.title).toBe('The Matrix');
      expect(response.runtime).toBe(136);
      expect(response.genres).toBeDefined();
    });

    const req = http.expectOne(`${environment.tmdb.baseUrl}/movie/603?language=en-US`);
    req.flush(mockTmdbMovie);
  });

  it('getGenres should fetch genre list', () => {
    const mockGenres: TmdbGenre[] = [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Science Fiction' }
    ];

    svc.getGenres().subscribe(response => {
      if ('error' in response) {
        fail('Expected successful response');
        return;
      }
      expect(response.genres.length).toBe(2);
      expect(response.genres[0].name).toBe('Action');
    });

    const req = http.expectOne(`${environment.tmdb.baseUrl}/genre/movie/list?language=en-US`);
    req.flush({ genres: mockGenres });
  });

  it('should handle API errors gracefully', () => {
    svc.discoverMovies().subscribe(response => {
      expect('error' in response).toBeTrue();
      if ('error' in response) {
        expect(response.error).toContain('Failed to load movies');
      }
    });

    const req = http.expectOne(r => r.url.includes('/discover/movie'));
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle 401 unauthorized errors', () => {
    svc.getMovieDetails(123).subscribe(response => {
      expect('error' in response).toBeTrue();
      if ('error' in response) {
        expect(response.error).toBe('Invalid TMDB API key');
      }
    });

    const req = http.expectOne(r => r.url.includes('/movie/123'));
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('getPosterUrl should return correct image URL', () => {
    const url = svc.getPosterUrl('/abc.jpg');
    expect(url).toBe(`${environment.tmdb.imgBase}/abc.jpg`);
  });

  it('getPosterUrl should handle null poster path', () => {
    const url = svc.getPosterUrl(null);
    expect(url).toBe('/placeholder-poster.jpg');
  });

  it('getBackdropUrl should return correct backdrop URL', () => {
    const url = svc.getBackdropUrl('/backdrop.jpg');
    expect(url).toBe('https://image.tmdb.org/t/p/w780/backdrop.jpg');
  });

  it('getBackdropUrl should handle null backdrop path', () => {
    const url = svc.getBackdropUrl(null);
    expect(url).toBe('/placeholder-backdrop.jpg');
  });
});