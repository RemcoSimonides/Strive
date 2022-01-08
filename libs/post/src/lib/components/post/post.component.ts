import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
// Interface
import { Post } from '../../+state/post.firestore'

@Component({
  selector: 'post-main',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComponent implements OnInit {

  @Input() post: Post
  @Input() postRef: string
  
  constructor(
    private db: Firestore,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (this.postRef) {
      getDoc(doc(this.db, this.postRef)).then(snap => {
        if (snap.exists()) {
          this.post = snap.data() as Post;
          this.cdr.markForCheck()
        }
      })
    }    
  }

}
