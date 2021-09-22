import { Component } from '@angular/core';

@Component({
  selector: 'strive-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Users', url: '/users', icon: 'people' },
    { title: 'Goals', url: '/goals', icon: 'flag' },
    { title: 'Collective Goals', url: '/collective-goals', icon: 'golf' },
  ];
}