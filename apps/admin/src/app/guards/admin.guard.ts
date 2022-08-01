import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { UserService } from '@strive/user/user/user.service';
import { map, switchMap } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class StriveAdminGuard implements CanActivate {
  constructor(
    private auth: Auth, 
    private router: Router,
    private user: UserService
  ) { }

  canActivate() {
    return user(this.auth).pipe(
      switchMap(user => {
        return this.user.isStriveAdmin(user.uid)
      }),
      map(isAdmin =>  isAdmin ? true : this.router.parseUrl('/'))
    )
  }
}
