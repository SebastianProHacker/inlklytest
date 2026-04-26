import { Component, ElementRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-container">
      <span class="search-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </span>
      <input #inp type="text" placeholder="Search..." (input)="onSearch($event)">
    </div>
  `,
  styleUrls: ['search-input.component.css']
})
export class SearchInputComponent {
  @Output() search = new EventEmitter<string>();
  @ViewChild('inp') inp!: ElementRef<HTMLInputElement>;

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }

  clearValue() {
    if (this.inp) {
      this.inp.nativeElement.value = '';
      this.search.emit('');
    }
  }
}