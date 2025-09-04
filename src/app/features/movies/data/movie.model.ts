export interface Movie {
  id: string;          // เช่น 'tt0111161' หรือ 'tmdb:603'
  title: string;
  year: number;        // 1994
  genres: string[];    // ['Drama','Action']
  poster: string;      // URL หรือ assets path
  rating: number;      // 0–10 (IMDB/TMDB vote avg)
  runtimeMin: number;  // นาที
  overview: string;
}