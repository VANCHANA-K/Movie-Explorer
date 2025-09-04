import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../data/movie.model';
import { MovieService } from '../../data/movie.service';

@Component({
  standalone: true,
  selector: 'app-movie-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss'
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  
  private svc = inject(MovieService);

  year = computed(() => this.movie?.year ?? '');
  genresText = computed(() => (this.movie?.genres || []).join(', '));
  isFav = computed(() => this.svc.isFavorite(this.movie.id));

  toggleFav(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.svc.toggleFavorite(this.movie.id);
  }
}
