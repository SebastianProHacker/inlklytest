import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchInputComponent],
  template: `
    <header class="header">
      <h2 class="page-title">{{ pageTitle }}</h2>
      <div class="header-center">
        <app-search-input (search)="onSearch($event)"></app-search-input>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SearchInputComponent) searchInput!: SearchInputComponent;

  pageTitle = '';
  private sub!: Subscription;

  private readonly routeTitles: Record<string, string> = {
    '/agenda': 'Agenda',
    '/warehouse': 'Warehouse',
    '/quotes': 'Quotes',
    '/dashboard': 'Dashboard',
    '/clients': 'Clients'
  };

  constructor(private router: Router, private searchService: SearchService) {}

  ngOnInit() {
    this.updateTitle(this.router.url);
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.updateTitle(e.url);
        this.searchService.reset();
        this.searchInput?.clearValue();
      });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private updateTitle(url: string) {
    const path = '/' + url.split('/')[1];
    this.pageTitle = this.routeTitles[path] ?? '';
  }

  onSearch(query: string) {
    this.searchService.setTerm(query);
  }
}