import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-skeleton-card',
  imports: [CommonModule],
  template: `
  <div class="card">
    <div class="poster shimmer"></div>
    <div class="info">
      <div class="line w80 shimmer"></div>
      <div class="line w50 shimmer"></div>
    </div>
  </div>`,
  styleUrl: './skeleton-card.scss'
})
export class SkeletonCardComponent {}
