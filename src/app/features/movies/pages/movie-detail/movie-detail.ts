import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService, MovieResult } from '../../data/movie.service';
import { Movie } from '../../data/movie.model';

@Component({
  standalone: true,
  selector: 'app-movie-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss'
})
export class MovieDetailComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(MovieService);
  
  movie?: Movie;
  loading = true;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const local = this.svc.getById(id);
    if (local) {
      this.movie = local;
      this.loading = false;
    } else {
      this.svc.getByIdOnline(id).subscribe((result: MovieResult) => {
        if (result.movie) {
          this.movie = result.movie;
        } else if (result.error) {
          console.error('Failed to load movie:', result.error);
        }
        this.loading = false;
      });
    }
  }

  genresText = computed(() => this.movie ? this.movie.genres.join(', ') : '');
  isFav = computed(() => (this.movie ? this.svc.isFavorite(this.movie.id) : false));

  toggleFav() {
    if (this.movie) {
      this.svc.toggleFavorite(this.movie.id);
    }
  }
}
