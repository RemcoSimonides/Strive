import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from '@env';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

if (environment.production) {
  enableProdMode();
}

function bootstrap() {
  platformBrowserDynamic()
  .bootstrapModule(AppModule)
  // Call the element loader after the platform has been bootstrapped
  .then(() => defineCustomElements(window))
  .catch((err) => console.error(err));
};


 if (document.readyState === 'complete') {
   bootstrap();
 } else {
   document.addEventListener('DOMContentLoaded', bootstrap);
 }
