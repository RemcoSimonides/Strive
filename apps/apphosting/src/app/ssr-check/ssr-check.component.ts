import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ssr-check',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ssr-check">
      <span *ngIf="isBrowser">Browser</span>
      <span *ngIf="!isBrowser">Server</span>
      <h3>SSR Check</h3>
      <!-- <p>Server-side timestamp (constructor): {{ serverTimestamp }}</p> -->
      <p>Server-side timestamp (ngOnInit): {{ serverNgOnInitTimestamp }}</p>
      <p>Client-side timestamp (ngOnInit): {{ clientTimestamp }}</p>
      <p>Is running in browser: {{ isBrowser }}</p>
      <p>Is SSR working: {{ isSSRWorking }}</p>
    </div>
  `,
  styles: [`
    .ssr-check {
      margin: 20px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: #f9f9f9;
    }
    h3 {
      margin-top: 0;
    }
    p {
      margin: 10px 0;
    }
  `]
})
export class SsrCheckComponent implements OnInit {
  // serverTimestamp: string;
  serverNgOnInitTimestamp = '';
  clientTimestamp = '';
  isBrowser: boolean;
  isSSRWorking = false;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // This will be executed on both server and client
    // this.serverTimestamp = new Date().toISOString();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // This will be executed on both server and client
    if (!this.isBrowser) {
      // Server-side execution
      this.serverNgOnInitTimestamp = new Date().toISOString();
    } else {
      // Client-side execution
      this.clientTimestamp = new Date().toISOString();
      this.isSSRWorking = !!this.serverNgOnInitTimestamp && (this.serverNgOnInitTimestamp !== this.clientTimestamp);
    }
  }
}