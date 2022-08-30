import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { user } from 'rxfire/auth'
import { getAuth } from 'firebase/auth';
import { UserService } from '@strive/user/user/user.service';
import { map, switchMap } from 'rxjs/operators'
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StriveAdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private user: UserService
  ) { }

  canActivate() {
    return user(getAuth()).pipe(
      switchMap(user => {
        if (!user) return of(false)
        return this.user.isStriveAdmin(user.uid)
      }),
      map(isAdmin =>  isAdmin ? true : this.router.parseUrl('/login'))
    )
  }
}
