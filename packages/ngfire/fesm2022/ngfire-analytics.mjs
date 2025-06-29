import { InjectionToken, inject } from '@angular/core';
import { initializeAnalytics } from 'firebase/analytics';
import { getConfig, ANALYTICS_SETTINGS } from 'ngfire/tokens';
import { FIREBASE_APP } from 'ngfire/app';

const FIRE_ANALYTICS = new InjectionToken('Firebase Analytics instance', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const settings = inject(ANALYTICS_SETTINGS, { optional: true });
        const app = inject(FIREBASE_APP);
        if (config.analytics) {
            return config.analytics(app, settings ?? {});
        }
        else {
            return initializeAnalytics(app, settings ?? {});
        }
    },
});

/**
 * Generated bundle index. Do not edit.
 */

export { FIRE_ANALYTICS };
//# sourceMappingURL=ngfire-analytics.mjs.map
