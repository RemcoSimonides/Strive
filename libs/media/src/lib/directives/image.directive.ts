import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { getAssetPath } from '../+state/media.model';
import { ImageParameters } from './imgix-helpers';

@Directive({
  selector: 'img[ref][asset], img[asset]'
})
export class ImageDirective implements OnInit, OnDestroy {
  private sub: Subscription;

  private parameters = new BehaviorSubject<ImageParameters>({
    auto: 'compress,format',
    fit: 'crop',
  });

  private asset$ = new BehaviorSubject('');
  private ref$ = new BehaviorSubject<string>(undefined);

  @HostBinding('srcset') srcset: string;
  @HostBinding('src') src: string;
  @HostBinding('alt') alt: string;
  @HostBinding('loading') _loading: 'lazy' | 'eager' = 'lazy';

  // -----------------------------------
  //           MEDIA IMAGE INPUT
  // -----------------------------------

  /** the image to display */
  @Input() set ref(file: string) {
    this.ref$.next(file);
  }

  @Input() set loading(strategy: 'lazy' | 'eager') {
    this._loading = strategy;
  }

  // -----------------------------------
  //   STATIC / PLACEHOLDER IMAGE INPUT
  // -----------------------------------

  @Input() set ratio(ar: string) {
    this.parameters.next({ ...this.parameters.getValue(), ar });
  }

  /**
   * The placeholder asset to display.
   * Just specify the file name, and the component
   * will compute the image path depending on the theme, image format, etc...
   * @example asset="empty_poster.webp"
   */
  @Input() set asset(asset: string) {
    this.asset$.next(asset);
  }

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  @HostListener('error')
  error() {
    const asset = this.asset$.getValue();
    this.srcset = getAssetPath(asset);
    this.src = this.srcset
  }

  ngOnInit() {
    const obs$: Observable<any>[] = [this.asset$, this.parameters, this.ref$]

    // apply latest changes
    this.sub = combineLatest(obs$).subscribe(async ([asset, params, ref]) => {
      if (!!ref) {
        // ref
        // this.srcset = await this.mediaService.generateImageSrcset(ref, params);
        this.src = ref;
        // this.src = this.srcset.split(' ')[0];
      } else {
        // asset
        this.srcset = getAssetPath(asset);
        this.src = this.srcset;
      }
      this.cdr.markForCheck()
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
