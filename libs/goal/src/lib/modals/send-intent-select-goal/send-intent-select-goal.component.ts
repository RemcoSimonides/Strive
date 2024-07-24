import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { CommonModule, Location } from '@angular/common'

import { IonTitle, IonContent, IonList, IonItem, IonThumbnail, IonLabel, ModalController } from '@ionic/angular/standalone'
import { Filesystem } from '@capacitor/filesystem'

import { Observable, of, shareReplay, switchMap } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { createPost, SendIntentPost, StakeholderWithGoal } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'
import { GoalService } from '@strive/goal/goal.service'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { isValidHttpUrl } from '@strive/utils/helpers'

@Component({
  standalone: true,
  selector: 'strive-send-intent-select-goal',
  templateUrl: 'send-intent-select-goal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ImageDirective,
    HeaderModalComponent,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel
  ]
})
export class SendIntentSelectGoalComponent extends ModalDirective {

  @Input() sendIntentData: SendIntentPost = {}

  stakeholders$: Observable<StakeholderWithGoal[]>

  constructor(
    private auth: AuthService,
    private goal: GoalService,
    protected override location: Location,
    protected override modalCtrl: ModalController
  ) {
    super(location, modalCtrl)

    this.stakeholders$ = this.auth.user$.pipe(
      switchMap(profile => profile ? this.goal.getStakeholderGoals(profile.uid, 'isAchiever', false) : of([])),
      shareReplay({ bufferSize: 1, refCount: true })
    )
  }

  async createPost(goalId: string) {
    let image: File | undefined
    const post = createPost({
      id: goalId,
      goalId
    })

    if (this.sendIntentData.url) {
      const { url, title, type } = this.sendIntentData
      if (isValidHttpUrl(url)) {
        post.url = url
        if (title) post.description = title
      } else {
        const path = decodeURIComponent(url)
        try {
          const content = await Filesystem.readFile({ path })
          const file = dataToFile(title, type, content.data);
          image = file
        } catch (error) {
          console.error(error);
        }

      }
    }

    await this.dismiss()
    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: { post, image }
    }).then(modal => modal.present())
  }
}

function dataToFile(title = '', type = 'application/octet-stream', data: string | Blob) {
  let blob: Blob

  if (typeof data === 'string') {
    // Decode base64 data
    const binaryData = atob(data)

    // Convert binary data to Uint8Array
    const dataArray = new Uint8Array(binaryData.length)
    for(let i = 0; i < binaryData.length; i++) {
      dataArray[i] = binaryData.charCodeAt(i)
    }

    // Create Blob from Uint8Array
    blob = new Blob([dataArray], { type })
  } else {
    blob = data
  }

  // Create File object from Blob
  const file = new File([blob], title, { type, lastModified: Date.now() })

  return file
}