import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController, PopoverController } from '@ionic/angular'

import { getFunctions, httpsCallable } from 'firebase/functions'
import { getStorage, ref, deleteObject } from '@firebase/storage'

import { captureException } from '@sentry/capacitor'

import { debounceTime, filter } from 'rxjs/operators'
import { addYears } from 'date-fns'

import { PostService } from '@strive/post/post.service'
import { AuthService } from '@strive/auth/auth.service'
import { PostForm } from '@strive/post/forms/post.form'
import { createPost, Post } from '@strive/model'
import { isValidHttpUrl } from '@strive/utils/helpers'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'

@Component({
  selector: '[goalId] strive-post-upsert',
  templateUrl: './post-upsert.component.html',
  styleUrls: ['./post-upsert.component.scss'],
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
    if (!post.id) throw new Error('Upsert post modal needs id')
    if (!post.goalId) throw new Error('Upsert post modal needs goalId')
    this._post = post

    this.mode = post.createdAt ? 'update' : 'create'
    this.postForm.patchValue(post)
  }

  private sub = this.postForm.url.valueChanges.pipe(
    debounceTime(1000),
    filter(url => url ? isValidHttpUrl(url) : false)
  ).subscribe(async url => {
    if (isYoutube(url)) {
      const id = getYoutubeId(url)
      if (id) {
        this.postForm.youtubeId.setValue(id)
      }
    }

    const formValue = this.postForm.getRawValue()
    if (formValue.description && formValue.mediaURL) return

    this.scrapingUrl = true
    this.cdr.markForCheck()

    const scrape = httpsCallable(getFunctions(), 'scrapeMetatags')
    const scraped = await scrape({ url })
    const { error, result } = scraped.data as { error: string, result: any }
    if (error) {
      console.error(result)
      captureException(result)
    } else {
      const { image, description } = result
      if (!formValue.description) this.postForm.description.setValue(description ?? '')
      if (!formValue.mediaURL) this.postForm.mediaURL.setValue(image ?? '')
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

  override async dismiss(saved = false) {
    if (!saved && this.postForm.mediaURL.value) {
      const storageRef = ref(getStorage(), this.postForm.mediaURL.value)
      deleteObject(storageRef)
    }
    super.dismiss()
  }

  async submitPost() {
    if (!this.auth.uid) return

    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (!this.postForm.isEmpty) {
      const { date, description, mediaURL, url, youtubeId } = this.postForm.value
      const post = createPost({
        ...this.post,
        date,
        description,
        mediaURL,
        url,
        youtubeId,
        uid: this.auth.uid
      })

      await this.postService.upsert(post, { params: { goalId: post.goalId }})
    }

    this.dismiss(true)
  }

  async openDatePicker() {
    const maxDate = addYears(new Date(), 1)

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { maxDate, value: this.postForm.date.value },
      cssClass: 'datetime-popover'
    })
    popover.onDidDismiss().then(({ data, role }) => {
      if (role === 'remove') {
        this.postForm.date.setValue(new Date())
        this.postForm.date.markAsDirty()
      } else if (role === 'dismiss') {
        const date = new Date(data ?? new Date())
        this.postForm.date.setValue(date)
        this.postForm.date.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }
}

function isYoutube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

function getYoutubeId(url: string) {
  // https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
  const rx = new RegExp(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/)
  const match = url.match(rx)
  return match?.length === 2 ? match[1] : undefined
}