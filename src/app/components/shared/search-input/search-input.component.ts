// src/app/shared/components/search-input/search-input.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-container">
      <span class="search-icon">&#128269;</span>
      <input type="text" placeholder="Search" (input)="onSearch($event)">
    </div>
  `,
  styleUrls: ['search-input.component.css']
})
export class SearchInputComponent {
  @Output() search = new EventEmitter<string>();

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }
}