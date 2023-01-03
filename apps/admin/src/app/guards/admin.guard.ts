import { Injectable } from '@angular/core'
import { Router, CanActivate } from '@angular/router'

import { of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { AuthService } from '@strive/auth/auth.service'

@Injectable({ providedIn: 'root' })
export class StriveAdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate() {
    return this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of(false)
        return this.auth.isStriveAdmin(user.uid)
      }),
      map(isAdmin =>  isAdmin ? true : this.router.parseUrl('/login'))
    )
  }
}
