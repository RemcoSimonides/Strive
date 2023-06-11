import { Inject, Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { Observable } from 'rxjs'
import { take, map, tap } from 'rxjs/operators'

import { AuthService } from '../auth.service'


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService  {

  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject('APP_NAME') private appName: 'journal' | 'admin'
  ) { }

  canActivate(): Observable<boolean> {
    return this.auth.user$.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          // not logged in so redirect to login page with the return url and return false
          // this.router.navigate(['/'], { queryParams: { returnUrl: state.url }})
          const home = this.appName === 'journal' ? '/' : '/login'
          this.router.navigate([home])
          return false
        } else {
          return true
        }
      })
    )
  }
}
