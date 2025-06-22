import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'

import { of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { AuthService } from '@strive/auth/auth.service'

@Injectable({ providedIn: 'root' })
export class StriveAdminGuard  {
  private auth = inject(AuthService);
  private router = inject(Router);

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
