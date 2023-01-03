import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router'
import { getAuth } from 'firebase/auth'

@Component({
  selector: 'strive-shell',
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {

  public appPages = [
    { title: 'Dashboard', url: '/a/', icon: 'home' },
    { title: 'Users', url: '/a/users', icon: 'people' },
    { title: 'Goals', url: '/a/goals', icon: 'flag' },
    { title: 'Motivation', url: '/a/motivation', icon: 'flame' },
    { title: 'New Features', url: '/a/features', icon: 'boat' }
  ]

  constructor(private router: Router) {}

  logout() {
    getAuth().signOut()
    this.router.navigate(['/'])
  }
}
