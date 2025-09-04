import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card';
import { MovieService } from '../../data/movie.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  let svc: MovieService;

  const mockMovie = {
    id: 'tt0111161',
    title: 'The Shawshank Redemption',
    year: 1994,
    genres: ['Drama'],
    poster: 'assets/placeholder.jpg',
    rating: 9.3,
    runtimeMin: 142,
    overview: 'Two imprisoned men bond over a number of years...'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardComponent, HttpClientTestingModule]
    }).compileComponents();

    svc = TestBed.inject(MovieService);
    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    component.movie = mockMovie;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie information', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('The Shawshank Redemption');
    expect(compiled.querySelector('.rating')?.textContent).toContain('9.3');
    expect(compiled.querySelector('.year')?.textContent).toContain('1994');
  });

  it('should toggle favorite via service', () => {
    spyOn(svc, 'toggleFavorite');
    
    expect(svc.isFavorite(component.movie.id)).toBeFalse();
    
    const favButton = fixture.debugElement.query(By.css('.fav-btn'));
    favButton.nativeElement.click();
    
    expect(svc.toggleFavorite).toHaveBeenCalledWith(component.movie.id);
  });

  it('should show correct favorite state', () => {
    // Initially not favorite
    expect(component.isFav()).toBeFalse();
    expect(fixture.debugElement.query(By.css('.fav-btn'))?.nativeElement.textContent).toContain('☆');
    
    // Add to favorites
    svc.toggleFavorite(component.movie.id);
    fixture.detectChanges();
    
    expect(component.isFav()).toBeTrue();
    expect(fixture.debugElement.query(By.css('.fav-btn'))?.nativeElement.textContent).toContain('★');
  });

  it('should prevent click event bubbling on favorite button', () => {
    const mockEvent = new MouseEvent('click');
    spyOn(mockEvent, 'stopPropagation');
    
    component.toggleFav(mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should display genres correctly', () => {
    component.movie.genres = ['Drama', 'Crime'];
    fixture.detectChanges();
    
    const genreElements = fixture.debugElement.queryAll(By.css('.genre'));
    expect(genreElements.length).toBe(2);
    expect(genreElements[0].nativeElement.textContent).toContain('Drama');
    expect(genreElements[1].nativeElement.textContent).toContain('Crime');
  });

  it('should handle missing poster gracefully', () => {
    component.movie.poster = '';
    fixture.detectChanges();
    
    const img = fixture.debugElement.query(By.css('img'));
    expect(img.nativeElement.src).toContain('placeholder');
  });
});
