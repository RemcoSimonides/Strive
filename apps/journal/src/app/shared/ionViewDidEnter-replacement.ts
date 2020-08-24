// Fount this class on https://github.com/ionic-team/ionic/issues/16152
// ionViewDidEnter doesn't get called when switching back to an already-loaded page. This does the job

import { OnDestroy, Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  template: ''
})
export abstract class RouterPage implements OnDestroy {

    private ngUnsubscribe: Subject<void> = new Subject();

    constructor(router: Router, route: ActivatedRoute) {
        router.events.pipe(
            takeUntil(this.ngUnsubscribe),
            filter(event => event instanceof NavigationEnd),
            filter(_ => this._isComponentActive(
                router.routerState.snapshot.root.pathFromRoot,
                route.snapshot.component
            ))
        ).subscribe(_ => this.onEnter());
    }

    private _isComponentActive(path: ActivatedRouteSnapshot[], component: any): boolean {
        let isActive = false;
        path.forEach((ss: ActivatedRouteSnapshot) => {
            if (ss.component === component) {
                isActive = true;
            } else {
                isActive = this._isComponentActive(ss.children, component);
            }
        });
        return isActive;
    }

    abstract onEnter(): void;

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
