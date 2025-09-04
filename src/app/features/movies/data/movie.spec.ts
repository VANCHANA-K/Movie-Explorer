import { Movie } from './movie.model';

describe('Movie', () => {
  it('should create movie with required properties', () => {
    const movie: Movie = {
      id: 'tt1234567',
      title: 'Test Movie',
      year: 2023,
      genres: ['Action'],
      poster: '/test-poster.jpg',
      rating: 7.5,
      runtimeMin: 120,
      overview: 'A test movie'
    };
    
    expect(movie.id).toBe('tt1234567');
    expect(movie.title).toBe('Test Movie');
    expect(movie.year).toBe(2023);
    expect(movie.genres).toEqual(['Action']);
  });
});
