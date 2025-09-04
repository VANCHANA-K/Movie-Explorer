import { Movie } from './movie.model';

export const MOVIES_MOCK: Movie[] = [
  {
    id: 'tt0111161',
    title: 'The Shawshank Redemption',
    year: 1994,
    genres: ['Drama'],
    poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
    rating: 9.3,
    runtimeMin: 142,
    overview: 'Two imprisoned men bond over years, finding solace and eventual redemption.'
  },
  {
    id: 'tt0468569',
    title: 'The Dark Knight',
    year: 2008,
    genres: ['Action', 'Crime', 'Drama'],
    poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
    rating: 9.0,
    runtimeMin: 152,
    overview: 'Batman faces the Joker, a mastermind who plunges Gotham into chaos.'
  },
  {
    id: 'tt1375666',
    title: 'Inception',
    year: 2010,
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    rating: 8.8,
    runtimeMin: 148,
    overview: 'A thief enters dreams to steal secrets and plant ideas (inception).'
  },
  {
    id: 'tt0109830',
    title: 'Forrest Gump',
    year: 1994,
    genres: ['Drama', 'Romance'],
    poster: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
    rating: 8.8,
    runtimeMin: 142,
    overview: 'The extraordinary life of Forrest Gump intersects with key moments in history.'
  },
  {
    id: 'tt0133093',
    title: 'The Matrix',
    year: 1999,
    genres: ['Action', 'Sci-Fi'],
    poster: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
    rating: 8.7,
    runtimeMin: 136,
    overview: 'A hacker discovers reality is a simulation and joins a rebellion.'
  },
  {
    id: 'tt0120737',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    year: 2001,
    genres: ['Adventure', 'Fantasy'],
    poster: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg',
    rating: 8.8,
    runtimeMin: 178,
    overview: 'A fellowship embarks on a quest to destroy the One Ring.'
  }
];