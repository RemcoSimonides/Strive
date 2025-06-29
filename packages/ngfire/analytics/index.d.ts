import { InjectionToken } from '@angular/core';
import { Analytics } from 'firebase/analytics';

declare const FIRE_ANALYTICS: InjectionToken<Analytics>;

export { FIRE_ANALYTICS };
