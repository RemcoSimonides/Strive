import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavParams, IonContent, ModalController } from '@ionic/angular';
// Rxjs
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { DiscussionService } from '@strive/chat/+state/discussion.service';
import { DiscussionPaginationService } from '../../+state/discussion-pagination.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import {
  IDiscussion,
  enumDiscussionAudience,
  IComment,
  enumCommentType
} from '@strive/interfaces'

@Component({
  selector: 'strive-chat',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss'],
})
export class ChatModalPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) contentArea: IonContent
  scrolledToBottom: boolean = true

  subscription: Subscription

  enumDiscussionAudience = enumDiscussionAudience

  discussionId: string
  comments: IComment[] = []
  _comment: string
  discussion: IDiscussion

  constructor(
    public user: UserService,
    private db: FirestoreService,
    private discussionService: DiscussionService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    public paginationService: DiscussionPaginationService,
  ) {}

  async ngOnInit() {
    this.discussionId = this.navParams.get('discussionId')
    this.discussion = await this.db.docWithId$<IDiscussion>(`Discussions/${this.discussionId}`).pipe(take(1)).toPromise()

    this.paginationService.init(`Discussions/${this.discussionId}/Comments`, 'createdAt', { reverse: true, prepend: true, limit: 10 })
    this.paginationService.listenToUpdates()

    this.subscription = this.paginationService.data.subscribe(data => {
      if (data) {
        if (this.scrolledToBottom) {
          this.scrollToBottom()
        }
      }
    })

  }

  dismiss() {
    this.modalCtrl.dismiss()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  ionViewWillLeave() {
    this.paginationService.reset()
  }

  async logScrolling($event) {
    // https://stackoverflow.com/questions/56886454/how-to-detect-scroll-reached-end-in-ion-content-component-of-ionic-4

    if ($event.target.localName != "ion-content") {
      // not sure if this is required, just playing it safe
      return;
    }

    const scrollElement = await $event.target.getScrollElement();

    // minus clientHeight because trigger is scrollTop
    // otherwise you hit the bottom of the page before 
    // the top screen can get to 80% total document height
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;

    if (scrollHeight === currentScrollDepth) {
      this.scrolledToBottom = true
    } else {
      this.scrolledToBottom = false
    }

  }

  scrollToBottom() {
    this.contentArea.scrollToBottom()
  }

  async addReply(): Promise<void> {

    // do not allow empty enters
    if (this._comment == '') return

    const { uid, displayName, photoURL } = await this.user.getFirebaseUser();

    this.discussionService.addReply(this.discussionId, {
      text: this._comment,
      type: enumCommentType.sentByUser,
      uid: uid,
      username: displayName,
      photoURL: photoURL,
    })

    this._comment = ''

  }

  public loadData(event) {

    this.paginationService.loading.pipe(take(1)).subscribe(value => {
      if (value) {
        return
      } else {

        this.paginationService.more()
        event.target.complete();

        if (this.paginationService.done) {
          event.target.disabled = true
        }

      }
    })

  }

}
