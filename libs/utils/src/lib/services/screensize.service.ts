import { Injectable } from '@angular/core';
// Rxjs
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScreensizeService {

  private size = new BehaviorSubject<'desktop' | 'tablet' | 'mobile'>('mobile')
  public size$ = this.size.asObservable().pipe(distinctUntilChanged())

  private isDesktop = new BehaviorSubject<boolean>(false)
  public isDesktop$ = this.isDesktop.asObservable().pipe(distinctUntilChanged())

  private isTablet = new BehaviorSubject<boolean>(false)
  public isTablet$ = this.isTablet.asObservable().pipe(distinctUntilChanged())

  private isMobile = new BehaviorSubject<boolean>(false)
  public isMobile$ = this.isMobile.asObservable().pipe(distinctUntilChanged())

  onResize(size: number) {
    if (size > 760) {
      this.size.next('desktop')
      this.isDesktop.next(true);
      this.isTablet.next(false);
      this.isMobile.next(false);
    } else if (size > 568) {
      this.size.next('tablet')
      this.isDesktop.next(false);
      this.isTablet.next(true);
      this.isMobile.next(false);
    } else {
      this.size.next('mobile')
      this.isDesktop.next(false);
      this.isTablet.next(false);
      this.isMobile.next(true);
    }
  }
}
