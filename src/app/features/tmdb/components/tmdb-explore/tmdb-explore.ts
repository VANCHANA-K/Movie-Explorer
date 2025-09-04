import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { TmdbService, TmdbMovie, TmdbGenre } from '../../../../core/services/tmdb';

@Component({
  selector: 'app-tmdb-explore',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tmdb-explore.html',
  styleUrl: './tmdb-explore.scss'
})
export class TmdbExplore implements OnInit, OnDestroy {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private io?: IntersectionObserver;
  
  // State signals
  movies = signal<TmdbMovie[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedGenre = signal(0);
  searchQuery = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  genres = signal<TmdbGenre[]>([]);
  
  // Computed
  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  displayedMovies = computed(() => this.movies());
  
  searchQueryModel = '';
  
  constructor() {
    effect(() => {
      this.updateUrl();
    });
    
    effect(() => {
      if (this.searchQuery() || this.selectedGenre() !== 0) {
        this.resetAndLoad();
      }
    });
  }
  
  ngOnInit() {
    this.loadGenres();
    this.loadFromUrl();
    this.setupInfiniteScroll();
    
    // Setup infinite scroll after the view init
    setTimeout(() => {
      const trigger = document.querySelector('.scroll-trigger') as HTMLElement;
      if (trigger) {
        this.io?.observe(trigger);
      }
    }, 100);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.io?.disconnect();
  }
  
  private loadGenres() {
    this.tmdbService.getGenres().subscribe(response => {
      if ('error' in response) {
        console.error('Failed to load genres:', response.error);
      } else {
        this.genres.set([{ id: 0, name: 'All Genres' }, ...response.genres]);
      }
    });
  }
  
  private loadFromUrl() {
    const queryParams = this.route.snapshot.queryParams;
    const genre = queryParams['genre'] ? parseInt(queryParams['genre']) : 0;
    const search = queryParams['q'] || queryParams['search'] || ''; // Support both q and search for backward compatibility
    const page = queryParams['page'] ? parseInt(queryParams['page']) : 1;
    
    this.selectedGenre.set(genre);
    this.searchQuery.set(search);
    this.searchQueryModel = search;
    this.currentPage.set(1); // Always start from page 1
    
    // Load all pages up to the target page for proper state restoration
    this.loadPagesUpTo(page);
  }
  
  private loadPagesUpTo(targetPage: number) {
    this.loading.set(true);
    this.error.set(null);
    this.movies.set([]);
    
    // Load pages sequentially from 1 to targetPage
    this.loadPageSequence(1, targetPage);
  }
  
  private loadPageSequence(currentPage: number, targetPage: number) {
    const request$ = this.searchQuery() 
      ? this.tmdbService.searchMovies(this.searchQuery(), currentPage, this.selectedGenre() || undefined)
      : this.tmdbService.discoverMovies(currentPage, this.selectedGenre() || undefined);
    
    request$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if ('error' in response) {
          this.loading.set(false);
          this.error.set(response.error);
          return;
        }
        
        this.totalPages.set(response.total_pages);
        this.movies.update(current => [...current, ...response.results]);
        
        if (currentPage < targetPage && currentPage < response.total_pages) {
          // Continue loading next page
          this.loadPageSequence(currentPage + 1, targetPage);
        } else {
          // Finished loading all pages
          this.currentPage.set(targetPage);
          this.loading.set(false);
          
          // Reconnect scroll observer
          setTimeout(() => {
            const trigger = document.querySelector('.scroll-trigger') as HTMLElement;
            if (trigger && this.io) {
              this.io.disconnect();
              this.io.observe(trigger);
            }
          }, 100);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to load movies');
        console.error('Load pages sequence error:', err);
      }
    });
  }
  
  private updateUrl() {
    const queryParams: any = {};
    
    if (this.searchQuery()) {
      queryParams.mode = 'search';
      queryParams.q = this.searchQuery();
    } else if (this.selectedGenre() > 0) {
      queryParams.mode = 'discover';
    }
    
    if (this.selectedGenre() > 0) {
      queryParams.genre = this.selectedGenre();
    }
    
    if (this.currentPage() > 1) {
      queryParams.page = this.currentPage();
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }
  
  private resetAndLoad() {
    this.currentPage.set(1);
    this.movies.set([]);
    this.loadMovies();
  }
  
  private loadMovies() {
    if (this.loading()) return;
    
    this.loading.set(true);
    this.error.set(null);
    
    const request$ = this.searchQuery() 
      ? this.tmdbService.searchMovies(this.searchQuery(), this.currentPage(), this.selectedGenre() || undefined)
      : this.tmdbService.discoverMovies(this.currentPage(), this.selectedGenre() || undefined);
    
    request$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.loading.set(false);
        
        if ('error' in response) {
          this.error.set(response.error);
          return;
        }
        
        this.totalPages.set(response.total_pages);
        
        if (this.currentPage() === 1) {
          this.movies.set(response.results);
        } else {
          this.movies.update(current => [...current, ...response.results]);
        }
        
        // Reconnect scroll observer after content update
        setTimeout(() => {
          const trigger = document.querySelector('.scroll-trigger') as HTMLElement;
          if (trigger && this.io) {
            this.io.disconnect();
            this.io.observe(trigger);
          }
        }, 100);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to load movies');
        console.error('Load movies error:', err);
      }
    });
  }
  
  private setupInfiniteScroll() {
    this.io = new IntersectionObserver(
      entries => {
        const target = entries[0];
        if (target.isIntersecting && this.hasNextPage() && !this.loading()) {
          console.log(`Loading page ${this.currentPage() + 1}...`);
          requestAnimationFrame(() => {
            this.currentPage.update(page => page + 1);
            this.loadMovies();
          });
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
  }
  
  onGenreChange(genreId: number) {
    this.selectedGenre.set(genreId);
  }
  
  onSearch() {
    this.searchQuery.set(this.searchQueryModel);
  }
  
  onClear() {
    this.searchQueryModel = '';
    this.searchQuery.set('');
  }
  
  retry() {
    this.error.set(null);
    this.loadMovies();
  }
  
  getPosterUrl(posterPath: string | null): string {
    return this.tmdbService.getPosterUrl(posterPath);
  }
  
  getRating(vote: number): string {
    return vote.toFixed(1);
  }
  
  getYear(dateStr: string): string {
    return dateStr ? new Date(dateStr).getFullYear().toString() : '';
  }
  
}
