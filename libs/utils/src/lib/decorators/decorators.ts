import { coerceBooleanProperty } from "@angular/cdk/coercion";

import { coerce } from './boolean.decorator';

export const boolean = coerce(coerceBooleanProperty);