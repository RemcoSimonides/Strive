import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { SsrCheckComponent } from './ssr-check/ssr-check.component'
// import { IonicServerModule } from '@ionic/angular-server'
import { IonApp, IonTitle, IonContent, IonHeader, IonToolbar, Platform } from '@ionic/angular/standalone'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SsrCheckComponent,
    // IonicServerModule,
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
  ],
  template: `
    <h1>Test</h1>
    <ion-app>
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ title }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <app-ssr-check></app-ssr-check>
      </ion-content>
    </ion-app>
  `,
  styles: [`
    ion-content {
      --background: var(--ion-color-light);
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'journal';
  private platform = inject(Platform);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    console.log('initiated')
    if (isPlatformBrowser(this.platformId)) {
      this.platform.ready().then(() => {
        console.log('Ionic platform ready');
      });
    }
  }
}
