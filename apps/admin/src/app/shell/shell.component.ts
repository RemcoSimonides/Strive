import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'strive-shell',
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {

  public appPages = [
    { title: 'Users', url: '/a/users', icon: 'people' },
    { title: 'Goals', url: '/a/goals', icon: 'flag' },
    // { title: 'Collective Goals', url: '/a/collective-goals', icon: 'golf' },
  ];

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  logout() {
    this.auth.signOut();
    this.router.navigate(['/']);
  }
}
