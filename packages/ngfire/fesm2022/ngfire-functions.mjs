import * as i0 from '@angular/core';
import { InjectionToken, inject, Injector, Injectable } from '@angular/core';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FIREBASE_APP } from 'ngfire/app';
import { getConfig, REGION_OR_DOMAIN } from 'ngfire/tokens';

const CLOUD_FUNCTIONS = new InjectionToken('Firebase cloud functions', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const regionOrDomain = inject(REGION_OR_DOMAIN, { optional: true });
        const app = inject(FIREBASE_APP);
        if (config.functions) {
            return config.functions(app, regionOrDomain ?? undefined);
        }
        else {
            return getFunctions(app, regionOrDomain ?? undefined);
        }
    },
});

class CallableFunctions {
    injector = inject(Injector);
    callables = {};
    get function() {
        return this.injector.get(CLOUD_FUNCTIONS);
    }
    prepare(name) {
        if (!this.callables[name]) {
            this.callables[name] = httpsCallable(this.function, name);
        }
        return (data) => this.call(name, data);
    }
    async call(name, data, options) {
        if (!this.callables[name]) {
            this.callables[name] = httpsCallable(this.function, name, options);
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const result = await this.callables[name](data);
        return result.data;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: CallableFunctions, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: CallableFunctions, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: CallableFunctions, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CLOUD_FUNCTIONS, CallableFunctions };
//# sourceMappingURL=ngfire-functions.mjs.map
