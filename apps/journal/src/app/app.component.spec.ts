import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideFirebase } from '@strive/utils/firebase-init';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        provideFirebase({
          projectId: 'demo-test',
          apiKey: 'fake-api-key',
          appId: '1:1234567890:web:demo',
        }),
        provideServiceWorker('sw-master.js', { enabled: false }),
        { provide: 'APP_NAME', useValue: 'journal' },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
