import { Component, OnInit, Input } from '@angular/core';
// Ionic
import { MenuController, Platform } from '@ionic/angular'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() title: string

  constructor(
    private menuCtrl: MenuController,
    public _platform: Platform
  ) { }

  ngOnInit() {
  }

  toggleMenu(){
    this.menuCtrl.toggle()
  }

}
