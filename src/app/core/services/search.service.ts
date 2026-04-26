import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private termSubject = new BehaviorSubject<string>('');
  search$ = this.termSubject.asObservable();

  setTerm(term: string) {
    this.termSubject.next(term.toLowerCase().trim());
  }

  reset() {
    this.termSubject.next('');
  }
}
