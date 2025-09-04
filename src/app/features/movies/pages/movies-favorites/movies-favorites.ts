import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../data/movie.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card';

@Component({
  standalone: true,
  selector: 'app-movies-favorites',
  imports: [CommonModule, RouterLink, MovieCardComponent],
  templateUrl: './movies-favorites.html',
  styleUrl: './movies-favorites.scss'
})
export class MoviesFavoritesComponent {
  private svc = inject(MovieService);
  
  movies = computed(() => this.svc.getFavoriteMovies());
}
