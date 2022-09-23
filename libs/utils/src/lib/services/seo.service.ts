import { Injectable } from '@angular/core'
import { Title, Meta, MetaDefinition } from '@angular/platform-browser'
import { Router } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router
  ) { }

  generateTags({ title = '', description = 'Stay focused on your goals and help others achieve theirs', image = 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ffull_logo-1200x630.png?alt=media&token=88184b80-d54f-423a-8378-aa0e826b330e' }) {
    this.title.setTitle(title)
    const tags: MetaDefinition[] = [
      { name: 'og:url', content: `https://strivejournal.com/${this.router.url}` },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:image', content: image }
    ]

    for (const tag of tags) {
      this.meta.updateTag(tag)
    }
  }
}
