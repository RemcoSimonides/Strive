import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Rxjs
import { Observable } from 'rxjs'
import { take, map, tap } from 'rxjs/operators'
// Services
import { AuthService } from '../auth/auth.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    return this.auth.user$.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          // not logged in so redirect to login page with the return url and return false
          // this.router.navigate(['/explore'], { queryParams: { returnUrl: state.url }});
          this.router.navigate(['/explore']);
          return false
        } else {
          return true
        }
      })
    )
  }
  
}
