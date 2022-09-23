import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController, PopoverController } from '@ionic/angular'

import { getFunctions, httpsCallable } from 'firebase/functions'

import { captureException } from '@sentry/capacitor'

import { filter } from 'rxjs/operators'
import { addYears } from 'date-fns'

import { PostService } from '@strive/post/post.service'
import { AuthService } from '@strive/user/auth/auth.service'
import { PostForm } from '@strive/post/forms/post.form'
import { createPost, Post } from '@strive/model'
import { isValidHttpUrl } from '@strive/utils/helpers'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'

@Component({
  selector: '[goalId] post-upsert-modal',
  templateUrl: './upsert-modal.component.html',
  styleUrls: ['./upsert-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpsertPostModalComponent extends ModalDirective implements OnDestroy {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent
  
  postForm = new PostForm()
  scrapingUrl = false
  mode: 'create' | 'update' = 'create'
  
  private _post!: Post
  get post() { return this._post }
  @Input() set post(post: Post) {
    if (!post.goalId) throw new Error('Upsert post modal needs goalId')
    this._post = post

    this.mode = post.createdAt ? 'update' : 'create'
    this.postForm.patchValue(post)
  }

  private sub = this.postForm.url.valueChanges.pipe(
    filter(url => url ? isValidHttpUrl(url) : false)
  ).subscribe(async url => {
    this.scrapingUrl = true;
    this.cdr.markForCheck()

    const scrape = httpsCallable(getFunctions(), 'scrapeMetatags')
    const scraped = await scrape({ url })
    const { error, result } = scraped.data as { error: string, result: any }
    if (error) {
      console.error(result)
      captureException(result)
    } else {
      const { image, title, description } = result.meta;
      this.postForm.title.setValue(title ?? '')
      this.postForm.description.setValue(description ?? '')
      this.postForm.mediaURL.setValue(image ?? '')
    }

    this.scrapingUrl = false
    this.cdr.markForCheck()
  })

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private postService: PostService
  ) {
    super(location, modalCtrl)
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  async submitPost() {
    if (!this.auth.uid) return

    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (!this.postForm.isEmpty) {
      const { date, description, mediaURL, title, url } = this.postForm.value
      const post = createPost({
        ...this.post,
        date,
        description,
        mediaURL,
        title,
        url,
        uid: this.auth.uid
      })

      await this.postService.upsert(post, { params: { goalId: post.goalId }});
    }

    this.dismiss()
  }

  async openDatePicker() {
    const maxDate = addYears(new Date(), 1)

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { maxDate, value: this.postForm.date.value }
    })
    popover.onDidDismiss().then(({ data, role }) => {
      if (role === 'remove') {
        this.postForm.date.setValue(new Date())
        this.postForm.date.markAsDirty()
      } else if (role === 'dismiss') {
        const date = new Date(data)
        this.postForm.date.setValue(date)
        this.postForm.date.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }

}
