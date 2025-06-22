import { isPlatformServer } from '@angular/common'
import { Injectable, PLATFORM_ID, inject } from '@angular/core'

import { BehaviorSubject } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class ScreensizeService {
  private platformId = inject(PLATFORM_ID);


  private size = new BehaviorSubject<'desktop' | 'tablet' | 'mobile'>('mobile')
  public size$ = this.size.asObservable().pipe(distinctUntilChanged())

  private width = new BehaviorSubject<number>(0)
  public width$ = this.width.asObservable().pipe(distinctUntilChanged())

  private isDesktop = new BehaviorSubject<boolean>(false)
  public isDesktop$ = this.isDesktop.asObservable().pipe(distinctUntilChanged())

  private isTablet = new BehaviorSubject<boolean>(false)
  public isTablet$ = this.isTablet.asObservable().pipe(distinctUntilChanged())

  private isMobile = new BehaviorSubject<boolean>(false)
  public isMobile$ = this.isMobile.asObservable().pipe(distinctUntilChanged())
  public isNotMobile$ = this.isMobile$.pipe(map(isMobile => !isMobile))

  onResize(size: number) {
    this.width.next(size)

    if (isPlatformServer(this.platformId)) {
      this.size.next('desktop')
      this.isDesktop.next(true)
      this.isTablet.next(false)
      this.isMobile.next(false)
      this.width.next(1096)
      return
    }

    if (size > 768) { // 768 is equal to where modals are not full screen anymore
      this.size.next('desktop')
      this.isDesktop.next(true)
      this.isTablet.next(false)
      this.isMobile.next(false)
    } else if (size > 568) {
      this.size.next('tablet')
      this.isDesktop.next(false)
      this.isTablet.next(true)
      this.isMobile.next(false)
    } else {
      this.size.next('mobile')
      this.isDesktop.next(false)
      this.isTablet.next(false)
      this.isMobile.next(true)
    }
  }
}
