export const environment = {
  production: false,
  omdb: {
    baseUrl: 'https://www.omdbapi.com/',
    apiKey: '59d50883' // Your OMDb API key - 1,000 requests/day
  },
  tmdb: {
    baseUrl: 'https://api.themoviedb.org/3',
    apiKey: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDViMTA4NWIyODRlNGE3YTYwMWJjMThlYmJjZWZiNSIsIm5iZiI6MTc1NjI2Nzc2NS4wNTUsInN1YiI6IjY4YWU4NGY1Nzc3ZDVkNWY1NWIzNmVlMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.CawHHoALXWs5ipeuO_cSwaQnwnc3Nqu3l_4711pBgDs', // TMDB API Read Access Token
    imgBase: 'https://image.tmdb.org/t/p/w342'
  }
};