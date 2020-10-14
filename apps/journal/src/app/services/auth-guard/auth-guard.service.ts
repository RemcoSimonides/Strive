import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Rxjs
import { Observable } from 'rxjs'
import { take, map, tap } from 'rxjs/operators'
// Services
import { UserService } from '@strive/user/user/+state/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private user: UserService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    return this.user.user$.pipe(
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
