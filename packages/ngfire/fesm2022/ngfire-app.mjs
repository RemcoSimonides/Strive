import { InjectionToken, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { FIREBASE_CONFIG, FIREBASE_APP_SETTINGS } from 'ngfire/tokens';

const FIREBASE_APP = new InjectionToken('Firebase application', {
    providedIn: 'root',
    factory: () => {
        const config = inject(FIREBASE_CONFIG);
        const settings = inject(FIREBASE_APP_SETTINGS, { optional: true });
        if (config.app) {
            return config.app();
        }
        else {
            return initializeApp(config.options, settings ?? {});
        }
    },
});

/**
 * Generated bundle index. Do not edit.
 */

export { FIREBASE_APP };
//# sourceMappingURL=ngfire-app.mjs.map
