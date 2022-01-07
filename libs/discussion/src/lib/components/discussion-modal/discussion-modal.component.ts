import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { NavParams, IonContent, ModalController } from '@ionic/angular';
// Rxjs
import { Observable, Subscription } from 'rxjs';
// Services
import { DiscussionService } from '@strive/discussion/+state/discussion.service';
import { DiscussionPaginationService } from '../../+state/discussion-pagination.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { createComment } from '@strive/discussion/+state/comment.firestore';
import { Discussion } from '@strive/discussion/+state/discussion.firestore';
import { createUserLink } from '@strive/user/user/+state/user.firestore';

@Component({
  selector: 'discussion-page',
  templateUrl: './discussion-modal.component.html',
  styleUrls: ['./discussion-modal.component.scss'],
})
export class DiscussionModalComponent implements OnInit, OnDestroy {
  scrolledToBottom = true

  subscription: Subscription

  discussionId: string
  _comment: string
  discussion$: Observable<Discussion>

  visibility = {
    public: 'Messages visible to everyone',
    team: 'Messages only visible to team',
    adminsAndRequestor: 'Visible to Requestor and Admins only',
    achievers: 'Visisble to Achievers only',
    spectators: 'Visible to spectators only'
  }

  @ViewChild(IonContent) contentArea: IonContent
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  constructor(
    public user: UserService,
    private discussion: DiscussionService,
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    public paginationService: DiscussionPaginationService,
  ) {
    window.history.pushState(null, null, window.location.href)
    this.modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnInit() {
    this.discussionId = this.navParams.get('discussionId')
    this.discussion$ = this.discussion.valueChanges(this.discussionId)

    this.paginationService.init(`Discussions/${this.discussionId}/Comments`, 'createdAt', { reverse: true, prepend: true, limit: 10 })
    this.paginationService.listenToUpdates()

    this.subscription = this.paginationService.data.subscribe(data => {
      if (data && this.scrolledToBottom) {
        this.contentArea?.scrollToBottom()
      }
    })
  }

  dismiss() {
    this.location.back()
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

    this.scrolledToBottom = scrollHeight === currentScrollDepth
  }

  async addReply() {
    if (!this._comment) return

    const { uid, displayName, photoURL } = await this.user.getFirebaseUser();

    const comment = createComment({
      text: this._comment,
      type: 'sentByUser',
      user: createUserLink({ uid, username: displayName, photoURL })
    })
    this.discussion.comment.add(comment, { params: { discussionId: this.discussionId }})

    this._comment = ''
  }

  loadData(event) {
    this.paginationService.more()
    event.target.complete();

    if (this.paginationService.done) {
      event.target.disabled = true
    }
  }
}