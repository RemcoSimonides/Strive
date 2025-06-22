import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import { getAuth } from 'firebase/auth'

@Component({
    selector: 'strive-shell',
    templateUrl: './shell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ShellComponent {
  private router = inject(Router);


  public appPages = [
    { title: 'Dashboard', url: '/a/', icon: 'home' },
    { title: 'Users', url: '/a/users', icon: 'people' },
    { title: 'Goals', url: '/a/goals', icon: 'flag' },
    { title: 'Motivation', url: '/a/motivation', icon: 'flame' },
    { title: 'New Features', url: '/a/features', icon: 'boat' }
  ]


  logout() {
    getAuth().signOut()
    this.router.navigate(['/'])
  }
}
