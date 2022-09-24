import { Injectable } from '@angular/core'
import { Title, Meta, MetaDefinition } from '@angular/platform-browser'
import { Router } from '@angular/router'

const initial: MetaDefinition[] = [
  { name: 'og:title', content: 'Strive Journal' },
  { name: 'og:description', content: 'Stay focused on your goals and help others achieve theirs!' },
  { name: 'og:type', content: 'website' },
  { name: 'og:url', content: 'https://strivejournal.com/' },
  { name: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ffull_logo-1200x630.png?alt=media&token=88184b80-d54f-423a-8378-aa0e826b330e' }
]

function getInitial(name: string) {
  return initial.find(tag => tag.name === name)?.content ?? ''
}

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router
  ) { }

  generateTags({ title = getInitial('og:title'), description = getInitial('og:description'), image = getInitial('og:image') }) {
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

  setInitial() {
    for (const tag of initial) {
      this.meta.addTag(tag)
    }
  }
}
