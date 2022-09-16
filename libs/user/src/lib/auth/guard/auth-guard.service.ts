import { Inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Rxjs
import { Observable } from 'rxjs'
import { take, map, tap } from 'rxjs/operators'
// Services
import { UserService } from '@strive/user/user/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private user: UserService,
    @Inject('APP_NAME') private appName: 'journal' | 'admin'
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.user.user$.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          // not logged in so redirect to login page with the return url and return false
          // this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
          const home = this.appName === 'journal' ? '/' : '/login'
          this.router.navigate([home]);
          return false
        } else {
          return true
        }
      })
    )
  }
}
