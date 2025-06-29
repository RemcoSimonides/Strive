import * as _firebase_functions from '@firebase/functions';
import { HttpsCallableOptions, Functions } from 'firebase/functions';
import * as i0 from '@angular/core';
import { InjectionToken } from '@angular/core';

declare class CallableFunctions {
    private injector;
    private callables;
    protected get function(): _firebase_functions.Functions;
    prepare<I, O>(name: string): (data: I) => Promise<O>;
    call<I, O>(name: string, data: I, options?: HttpsCallableOptions): Promise<O>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CallableFunctions, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CallableFunctions>;
}

declare const CLOUD_FUNCTIONS: InjectionToken<Functions>;

export { CLOUD_FUNCTIONS, CallableFunctions };
