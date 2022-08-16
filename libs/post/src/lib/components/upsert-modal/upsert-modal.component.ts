import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { getFunctions, httpsCallable } from 'firebase/functions'
import { ModalController, PopoverController } from '@ionic/angular'

import { filter } from 'rxjs/operators';
import { addYears } from 'date-fns'

import { PostService } from '@strive/post/post.service';
import { UserService } from '@strive/user/user/user.service';
import { PostForm } from '@strive/post/forms/post.form';
import { createPost } from '@strive/model';
import { isValidHttpUrl } from '@strive/utils/helpers';
import { ModalDirective } from '@strive/utils/directives/modal.directive';
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component';
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component';

@Component({
  selector: '[goalId] post-upsert-modal',
  templateUrl: './upsert-modal.component.html',
  styleUrls: ['./upsert-modal.component.scss'],
})
export class UpsertPostModalComponent extends ModalDirective implements OnInit, OnDestroy {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent
  
  postForm = new PostForm()
  scrapingUrl = false
  
  @Input() postId?: string
  @Input() goalId!: string
  @Input() milestoneId?: string

  private sub = this.postForm.url.valueChanges.pipe(
    filter(url => url ? isValidHttpUrl(url) : false)
  ).subscribe(async url => {
    this.scrapingUrl = true;
    const scrape = httpsCallable(getFunctions(), 'scrapeMetatags')
    const scraped = await scrape({ url })
    const { error, result } = scraped.data as { error: string, result: any }
    if (error) {
      console.error(result)
    } else {
      const { image, title, description } = result.meta;
      this.postForm.title.setValue(title ?? '')
      this.postForm.description.setValue(description ?? '')
      this.postForm.mediaURL.setValue(image ?? '')
    }
    this.scrapingUrl = false;
  })

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private postService: PostService,
    private user: UserService,
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    const isEvidence = !!this.postId;
    if (!this.postId) this.postId = this.postService.createId()
    if (!this.goalId) throw new Error('No goal to post the post at')

    this.postForm.isEvidence.setValue(isEvidence)
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  async submitPost() {
    if (!this.user.uid) return

    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (!this.postForm.isEmpty) {
      const { date, description, isEvidence, mediaURL, title, url } = this.postForm.value
      const post = createPost({
        id: this.postId,
        goalId: this.goalId,
        uid: this.user.uid,
        date: date!,
        description: description!,
        isEvidence: isEvidence!,
        mediaURL: mediaURL!,
        title: title!,
        url: url!
      })
      if (this.milestoneId) post.milestoneId = this.milestoneId
      await this.postService.add(post, { params: { goalId: this.goalId }});
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
      } else if (role === 'dismiss') {
        const date = new Date(data)
        this.postForm.date.setValue(date)
      }
    })
    popover.present()
  }

}
