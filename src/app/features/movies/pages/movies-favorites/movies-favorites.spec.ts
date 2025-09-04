import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MoviesFavoritesComponent } from './movies-favorites';

describe('MoviesFavoritesComponent', () => {
  let component: MoviesFavoritesComponent;
  let fixture: ComponentFixture<MoviesFavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviesFavoritesComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoviesFavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
