import { TestBed } from '@angular/core/testing';
import { MovieService } from './movie.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

describe('MovieService', () => {
  let svc: MovieService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    svc = TestBed.inject(MovieService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  it('getAll / getById should work with mock', () => {
    const all = svc.getAll();
    expect(all.length).toBeGreaterThan(0);
    const one = svc.getById(all[0].id);
    expect(one?.title).toBeTruthy();
  });

  it('filterMovies should filter by genre and query', () => {
    const drama = svc.filterMovies({ genre: 'Drama' });
    expect(drama.every(m => m.genres.includes('Drama'))).toBeTrue();

    const dark = svc.filterMovies({ q: 'dark' });
    expect(dark.some(m => 
      m.title.toLowerCase().includes('dark') || 
      m.overview.toLowerCase().includes('dark')
    )).toBeTrue();
  });

  it('getAllGenres should return unique genres', () => {
    const genres = svc.getAllGenres();
    expect(genres.length).toBeGreaterThan(0);
    expect(new Set(genres).size).toBe(genres.length); // all unique
  });

  it('favorites should toggle and persist', () => {
    const id = svc.getAll()[0].id;
    expect(svc.isFavorite(id)).toBeFalse();
    
    svc.toggleFavorite(id);
    expect(svc.isFavorite(id)).toBeTrue();

    // Test persistence by creating new instance
    const newService = TestBed.inject(MovieService);
    expect(newService.isFavorite(id)).toBeTrue();
  });

  it('getFavoriteMovies should return favorited movies', () => {
    const movie = svc.getAll()[0];
    svc.toggleFavorite(movie.id);
    
    const favorites = svc.getFavoriteMovies();
    expect(favorites.length).toBe(1);
    expect(favorites[0].id).toBe(movie.id);
  });

  it('searchOnline should map OMDb results', () => {
    const q = 'inception';
    
    svc.searchOnline(q).subscribe(result => {
      expect(result.movies.length).toBe(1);
      expect(result.movies[0].id).toBe('tt1375666');
      expect(result.movies[0].title).toBe('Inception');
    });

    const req = http.expectOne(r => 
      r.url.startsWith(environment.omdb.baseUrl) && 
      r.url.includes('s=inception') &&
      r.method === 'GET'
    );
    
    // Mock OMDb response
    req.flush({
      Response: 'True',
      Search: [{ 
        imdbID: 'tt1375666', 
        Title: 'Inception', 
        Year: '2010', 
        Poster: 'http://example.com/poster.jpg' 
      }]
    });
  });

  it('searchOnline should handle errors', () => {
    svc.searchOnline('test').subscribe(result => {
      expect(result.error).toBeTruthy();
      expect(result.movies.length).toBe(0);
    });

    const req = http.expectOne(r => r.url.startsWith(environment.omdb.baseUrl));
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('getByIdOnline should map detail', () => {
    svc.getByIdOnline('tt1375666').subscribe(result => {
      expect(result.movie?.title).toBe('Inception');
      expect(result.movie?.genres).toEqual(['Action', 'Sci-Fi']);
      expect(result.movie?.runtimeMin).toBe(148);
      expect(result.movie?.rating).toBe(8.8);
    });

    const req = http.expectOne(r => 
      r.url.includes('i=tt1375666') && 
      r.method === 'GET'
    );
    
    req.flush({
      Response: 'True',
      imdbID: 'tt1375666',
      Title: 'Inception',
      Year: '2010',
      Runtime: '148 min',
      Genre: 'Action, Sci-Fi',
      Poster: 'http://example.com/poster.jpg',
      Plot: 'A thief who steals corporate secrets...',
      imdbRating: '8.8'
    });
  });

  it('getByIdOnline should handle movie not found', () => {
    svc.getByIdOnline('invalid').subscribe(result => {
      expect(result.error).toBeTruthy();
      expect(result.movie).toBeUndefined();
    });

    const req = http.expectOne(r => r.url.includes('i=invalid'));
    req.flush({
      Response: 'False',
      Error: 'Movie not found!'
    });
  });
});