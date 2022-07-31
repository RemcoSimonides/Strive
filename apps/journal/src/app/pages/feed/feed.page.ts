// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
// import { ModalController } from '@ionic/angular';
// import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
// import { DocumentData } from 'rxfire/firestore/interfaces';
// import { orderBy, QueryConstraint } from 'firebase/firestore';
// // Strive
// import { collection, endBefore, Firestore, getDocs, limit, query, Query, startAfter, where } from '@angular/fire/firestore';
// import { UserService } from '@strive/user/user/+state/user.service';
// import { SeoService } from '@strive/utils/services/seo.service';
// import { Notification } from '@strive/notification/+state/notification.firestore';
// import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
// import { NotificationService } from '@strive/notification/+state/notification.service';
// import { delay } from '@strive/utils/helpers';

// @Component({
//   selector: 'journal-feed',
//   templateUrl: './feed.page.html',
//   styleUrls: ['./feed.page.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class FeedComponent implements OnDestroy {
//   private notificationsPerQuery = 20
//   private query: Query<DocumentData>

//   private _notifications = new BehaviorSubject<Notification[]>([])
//   private _done = new BehaviorSubject<boolean>(false)
//   private _loading = new BehaviorSubject<boolean>(false)
//   notifications$ = this._notifications.asObservable()

//   enumAuthSegment = enumAuthSegment
  
//   decisions$: Observable<Notification[]>

//   private sub: Subscription

//   constructor(
//     private db: Firestore,
//     public user: UserService,
//     private modalCtrl: ModalController,
//     private notification: NotificationService,
//     private seo: SeoService,
//     private cdr: ChangeDetectorRef
//   ) {
//     this.seo.generateTags({ title: `Feed - Strive Journal` })

//     this.sub = this.user.user$.subscribe(user => {
//       if (user) {
//         const ref = collection(this.db, `Users/${user.uid}/Notifications`)
//         const constraints = [
//           where('type', '==', 'feed'),
//           orderBy('createdAt', 'desc'),
//           limit(this.notificationsPerQuery)
//         ]
//         this.query = query(ref, ...constraints)
//         this.mapAndUpdate([])
//       } else {
//         this._notifications.next([])
//         this._done.next(false)
//       }
//       this.cdr.markForCheck()
//     })

//     this.decisions$ = this.user.user$.pipe(
//       switchMap(user => user
//         ? this.notification.valueChanges([where('needsDecision', '==', true)], { uid: user.uid })
//         : of([])),
//     )
//   }

//   ngOnDestroy() {
//     this.sub.unsubscribe()
//   }

//   openAuthModal(authSegment: enumAuthSegment) {
//     this.modalCtrl.create({
//       component: AuthModalComponent,
//       componentProps: { authSegment }
//     }).then(modal => modal.present())
//   }

//   private async mapAndUpdate(queryConstraints: QueryConstraint[], isRefresh = false) {
//     if (!isRefresh && (this._done.value || this._loading.value)) return
//     this._loading.next(true)

//     const snapshot = await getDocs(query(this.query, ...queryConstraints))
//     if (!snapshot.empty) {
//       // const notifications = snapshot.docs.map(doc => {
//       //   return createNotification({ ...doc.data(), id: doc.id })
//       //   // return { ...data, 'discussion$': this.discussion.valueChanges(data.discussionId) }
//       // })
//       // const next = isRefresh ? [...notifications, ...this._notifications.value] : [...this._notifications.value, ...notifications]
//       // this._notifications.next(next)
//     }
//     if (!isRefresh && (snapshot.empty || snapshot.size < this.notificationsPerQuery)) this._done.next(true)
//     this._loading.next(false)
//   }

//   async more($event) {
//     const posts = this._notifications.value
//     const cursor = posts[posts.length - 1].createdAt ?? null

//     await Promise.race([
//       delay(5000),
//       this.mapAndUpdate([startAfter(cursor)])
//     ])

//     $event.target.complete()
//     if (this._done.value) {
//       $event.target.disabled = true
//     }
//   }

//   async refresh($event) {
//     const cursor = this._notifications.value[0]?.createdAt ?? null
//     await Promise.race([
//       delay(5000),
//       this.mapAndUpdate([endBefore(cursor)], true).then(() => delay(500))
//     ])
//     $event.target.complete()
//   }
// }
