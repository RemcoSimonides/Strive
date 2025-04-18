import { Pipe, PipeTransform } from '@angular/core'
import { isFuture, isToday } from 'date-fns'

@Pipe({ name: 'isToday', standalone: true })
export class IsTodayPipe implements PipeTransform {
  transform(date: Date) {
    return isToday(date)
  }
}

@Pipe({ name: 'toDate', standalone: true })
export class ToDatePipe implements PipeTransform {
  transform(date: string) {
    return new Date(date)
  }
}

@Pipe({ name: 'isFuture', standalone: true })
export class IsFuturePipe implements PipeTransform {
  transform(date: Date) {
    return isFuture(date)
  }
}