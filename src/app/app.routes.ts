import { Routes } from '@angular/router';
import { MoviesListComponent } from './features/movies/pages/movies-list/movies-list';
import { MovieDetailComponent } from './features/movies/pages/movie-detail/movie-detail';
import { MoviesFavoritesComponent } from './features/movies/pages/movies-favorites/movies-favorites';
import { TmdbExplore } from './features/tmdb/components/tmdb-explore/tmdb-explore';
import { TmdbDetail } from './features/tmdb/components/tmdb-detail/tmdb-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: MoviesListComponent },
  { path: 'movies/favorites', component: MoviesFavoritesComponent },
  { path: 'movies/:id', component: MovieDetailComponent },
  { path: 'tmdb', component: TmdbExplore },
  { path: 'tmdb/:id', component: TmdbDetail },
  { path: '**', redirectTo: 'movies' }
];
