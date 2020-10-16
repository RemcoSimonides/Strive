import { Component, Input } from '@angular/core';
// Ionic
import { Platform } from '@ionic/angular'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  @Input() title: string

  constructor(
    public platform: Platform
  ) { }

}
