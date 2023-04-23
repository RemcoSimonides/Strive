import { Directive, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core'
import { isValidHttpUrl } from '@strive/utils/helpers'
import { Theme, ThemeService } from '@strive/utils/services/theme.service'
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs'
import { getImgIxResourceUrl, ImageParameters } from './imgix-helpers'

function getAssetPath(asset: string, theme: Theme) {
  return `assets/images/${theme}/${asset}`
}

@Directive({
  selector: 'img[ref][asset], img[asset]'
})
export class ImageDirective implements OnInit, OnDestroy {
  private sub?: Subscription

  private parameters = new BehaviorSubject<ImageParameters>({
    auto: 'compress,format',
    fit: 'crop',
  })

  private asset$ = new BehaviorSubject('')
  private ref$ = new BehaviorSubject<string | undefined>(undefined)

  @HostBinding('srcset') srcset = ''
  @HostBinding('src') src = ''
  @HostBinding('alt') alt = ''
  @HostBinding('loading') _loading: 'lazy' | 'eager' = 'lazy'

  // -----------------------------------
  //           MEDIA IMAGE INPUT
  // -----------------------------------

  /** the image to display */
  @Input() set ref(file: string | undefined) {
    this.ref$.next(file)
  }

  @Input() set loading(strategy: 'lazy' | 'eager') {
    this._loading = strategy
  }

  // -----------------------------------
  //   STATIC / PLACEHOLDER IMAGE INPUT
  // -----------------------------------

  @Input() set ratio(ar: string) {
    this.parameters.next({ ...this.parameters.getValue(), ar })
  }

  @Input() set height(h: number) {
    this.parameters.next({ ...this.parameters.getValue(), h })
  }

  @Input() set width(w: number) {
    this.parameters.next({ ...this.parameters.getValue(), w})
  }

  /**
   * The placeholder asset to display.
   * Just specify the file name, and the component
   * will compute the image path depending on the theme, image format, etc...
   * @example asset="empty_poster.webp"
   */
  @Input() set asset(asset: string) {
    this.asset$.next(asset)
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService
  ) { }

  @HostListener('error')
  error() {
    const asset = this.asset$.getValue()
    this.srcset = getAssetPath(asset, this.themeService.theme)
    this.src = this.srcset
  }

  ngOnInit() {
    const obs$: Observable<any>[] = [this.asset$, this.parameters, this.themeService.theme$, this.ref$]

    // apply latest changes
    this.sub = combineLatest(obs$).subscribe(async ([asset, params, theme, ref]) => {
      if (ref) {
        // ref
        if (isValidHttpUrl(ref)) {
          this.src = ref
          this.srcset = ref
        } else {
          this.srcset = getImgIxResourceUrl(ref, params)
          this.src = this.srcset.split(' ')[0]
        }
      } else {
        // asset
        this.srcset = getAssetPath(asset, theme)
        this.src = this.srcset
      }
      this.cdr.markForCheck()
    })
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }
}
