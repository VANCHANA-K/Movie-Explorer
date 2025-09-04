import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TmdbService, TmdbMovie } from '../../../../core/services/tmdb';
import { MovieService } from '../../../movies/data/movie.service';

@Component({
  selector: 'app-tmdb-detail',
  imports: [CommonModule],
  templateUrl: './tmdb-detail.html',
  styleUrl: './tmdb-detail.scss'
})
export class TmdbDetail implements OnInit, OnDestroy {
  private tmdbService = inject(TmdbService);
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  // State signals
  movie = signal<TmdbMovie | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isFavorite = signal(false);
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadMovie(parseInt(id));
    } else {
      this.error.set('Invalid movie ID');
      this.loading.set(false);
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadMovie(id: number) {
    this.loading.set(true);
    this.error.set(null);
    
    this.tmdbService.getMovieDetails(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        if ('error' in response) {
          this.error.set(response.error);
          return;
        }
        
        this.movie.set(response);
        this.checkFavoriteStatus(response);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to load movie details');
        console.error('Load movie details error:', err);
      }
    });
  }
  
  private checkFavoriteStatus(movie: TmdbMovie) {
    const movieId = `tmdb-${movie.id}`;
    this.isFavorite.set(this.movieService.isFavorite(movieId));
  }
  
  toggleFavorite() {
    const currentMovie = this.movie();
    if (!currentMovie) return;
    
    const movieId = `tmdb-${currentMovie.id}`;
    this.movieService.toggleFavorite(movieId);
    this.isFavorite.set(this.movieService.isFavorite(movieId));
  }
  
  retry() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadMovie(parseInt(id));
    }
  }
  
  goBack() {
    this.router.navigate(['/tmdb']);
  }
  
  getPosterUrl(posterPath: string | null): string {
    return this.tmdbService.getPosterUrl(posterPath);
  }
  
  getBackdropUrl(backdropPath: string | null): string {
    return this.tmdbService.getBackdropUrl(backdropPath);
  }
  
  getRating(vote: number): string {
    return vote.toFixed(1);
  }
  
  getYear(dateStr: string): string {
    return dateStr ? new Date(dateStr).getFullYear().toString() : '';
  }
  
  formatRuntime(runtime: number | undefined): string {
    if (!runtime) return 'N/A';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  
  formatMoney(amount: number | undefined): string {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  getProductionCompanies(): string {
    const currentMovie = this.movie();
    return currentMovie?.production_companies?.map(c => c.name).join(', ') || 'N/A';
  }
  
  getProductionCountries(): string {
    const currentMovie = this.movie();
    return currentMovie?.production_countries?.map(c => c.name).join(', ') || 'N/A';
  }
  
  getSpokenLanguages(): string {
    const currentMovie = this.movie();
    return currentMovie?.spoken_languages?.map(l => l.name).join(', ') || 'N/A';
  }
}
