import {
  Component, computed, signal, inject, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, SearchResult } from '../../data/movie.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { SkeletonCardComponent } from '../../../../shared/components/skeleton-card/skeleton-card';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { Movie } from '../../data/movie.model';

type SortKey = 'rating_desc' | 'rating_asc' | 'year_desc' | 'year_asc' | 'title_asc' | 'title_desc';

@Component({
  standalone: true,
  selector: 'app-movies-list',
  imports: [CommonModule, FormsModule, MovieCardComponent, SkeletonCardComponent],
  templateUrl: './movies-list.html',
  styleUrl: './movies-list.scss'
})
export class MoviesListComponent implements AfterViewInit, OnDestroy {
  private svc = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  genres = ['All', ...this.svc.getAllGenres()];

  // --- filters ---
  genre = signal<string>('All');
  q = signal<string>('');
  sort = signal<SortKey>('rating_desc');

  // --- local (mock) list + sorting + paging ---
  pageSize = 12;
  page = signal(1);

  baseList = computed(() => this.svc.filterMovies({ genre: this.genre(), q: this.q() }));
  sorted = computed(() => this.sortList(this.baseList(), this.sort()));
  paged = computed(() => this.sorted().slice(0, this.page() * this.pageSize));

  // --- Online (OMDb) search ---
  private q$ = new Subject<string>();
  searching = signal(false);
  onlineResults: Movie[] = [];
  onlineError = signal<string | null>(null);

  // --- infinite scroll ---
  @ViewChild('sentinel', { static: false }) sentinel?: ElementRef<HTMLDivElement>;
  private io?: IntersectionObserver;

  // --- URL sync control ---
  private isUpdatingFromUrl = false;
  private destroy$ = new Subject<void>();

  // sorting helper
  private sortList(list: Movie[], key: SortKey): Movie[] {
    const copy = [...list];
    
    // For stable sorting, include secondary sort by title for equal values
    const stableSort = (primary: (a: Movie, b: Movie) => number) => {
      return (a: Movie, b: Movie) => {
        const result = primary(a, b);
        return result !== 0 ? result : a.title.localeCompare(b.title);
      };
    };

    switch (key) {
      case 'rating_desc':
        return copy.sort(stableSort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
      case 'rating_asc':
        return copy.sort(stableSort((a, b) => (a.rating ?? 0) - (b.rating ?? 0)));
      case 'year_desc':
        return copy.sort(stableSort((a, b) => (b.year ?? 0) - (a.year ?? 0)));
      case 'year_asc':
        return copy.sort(stableSort((a, b) => (a.year ?? 0) - (b.year ?? 0)));
      case 'title_asc':
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return copy.sort(stableSort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
    }
  }

  constructor() {
    // 1) URL -> state (ตลอดเวลา รวมทั้งเปลี่ยน URL ตรง ๆ)
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const g = params['genre'];
      const query = params['q'];
      const s = params['sort'] as SortKey | null;
      
      // อัปเดต state จาก URL โดยไม่ trigger effect
      this.isUpdatingFromUrl = true;
      this.genre.set(g || 'All');
      this.q.set(query || '');
      this.sort.set(s || 'rating_desc');
      this.isUpdatingFromUrl = false;
    });

    // 2) state -> URL (เมื่อ user เปลี่ยน UI, ไม่ใช่จาก URL)
    effect(() => {
      if (this.isUpdatingFromUrl) {
        return;
      }
      
      const params: any = {};
      if (this.genre() !== 'All') params['genre'] = this.genre();
      if (this.q().trim()) params['q'] = this.q().trim();
      if (this.sort() !== 'rating_desc') params['sort'] = this.sort();

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params,
        queryParamsHandling: '',
        replaceUrl: true
      });
    });

    // reset page เมื่อ filter/search/sort เปลี่ยน
    effect(() => { 
      this.genre(); 
      this.q(); 
      this.sort(); 
      this.page.set(1); 
    });
    // online stream
    this.q$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        this.searching.set(true);
        this.onlineError.set(null); // Clear previous errors
        return this.svc.searchOnline(q);
      }),
      takeUntil(this.destroy$)
    ).subscribe((res: SearchResult) => {
      this.onlineResults = res.movies;
      this.onlineError.set(res.error || null);
      this.searching.set(false);
    });
  }

  // infinite scroll
  ngAfterViewInit() {
    if (!this.sentinel) return;
    this.io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const hasMore = this.paged().length < this.sorted().length;
          if (hasMore) {
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
              this.page.set(this.page() + 1);
            });
          }
        }
      }
    }, { 
      rootMargin: '200px',
      threshold: 0.1
    });
    this.io.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy() { 
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up IntersectionObserver
    this.io?.disconnect(); 
  }

  // trigger online search
  searchOnline() {
    this.q$.next(this.q());
  }

  // Auto-trigger search when typing (for debounce testing)
  onSearchInput(value: string) {
    this.q.set(value);
    if (value.trim()) {
      this.q$.next(value);
    }
  }
}
