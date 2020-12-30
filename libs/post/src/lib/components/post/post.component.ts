import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// Angularfire
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
// Rxjs
import { take } from 'rxjs/operators';
// Interface
import { Post } from '../../+state/post.firestore'

@Component({
  selector: 'strive-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit {

  @Input() post: Post
  @Input() postRef: string
  
  constructor(
    private db: FirestoreService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!!this.postRef) {
      this.db.doc<Post>(this.postRef).snapshotChanges().pipe(take(1)).toPromise().then(snap => {
        if (snap.payload.exists) {
          
          // Post does exist
          this.post = snap.payload.data()

          this.cdr.markForCheck()
        }
      })
    }    
  }

  // Depricated Chat
  // async goToPostChat(): Promise<void> {
    // const postChatParams: PostChatParams = {
    //   goalID: '',
    //   postID: ''
    // }
  
    // var splitted = this._postRef.split("/")
    // postChatParams.goalID = splitted[1]
    // postChatParams.postID = splitted[3]

    // this.navCtrl.push('PostChatPage', { postChatParams })
  // }

}
