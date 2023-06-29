import { Pipe, PipeTransform } from '@angular/core'
import { Comment } from '@strive/model'
import { BehaviorSubject, combineLatest, map, of, timer } from 'rxjs'

@Pipe({ name: 'toThinking', standalone: true })
export class ThinkingPipe implements PipeTransform {

  thinking$ = combineLatest([
    timer(0, 1000),
    new BehaviorSubject('.'),
  ]).pipe(
    map(([time]) => {
      if (time % 3 === 0) return '.'
      if (time % 3 === 1) return '..'
      return '...'
    })
  )

  transform(value: string, comment: Comment) {
    const status = comment.status

    if (status === 'waiting' || status === 'streaming') {
      return this.thinking$.pipe(
        map(thinking => value + thinking)
      )
    }

    if (status === 'error') {
      return of('Sorry, I could not find an answer to your question. Please try again.')
    }

    return of(value)
  }
}
