import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { WheelOfLifeEntry } from '@strive/model'
import { formatISO } from 'date-fns'

export function getPreviousEntry(entries: WheelOfLifeEntry<number>[]): WheelOfLifeEntry<number> | undefined {
  const today = formatISO(new Date(), { representation: 'date' })
  return entries.filter(e => e.id !== today).pop()
}

@Pipe({
  name: 'today'
})
export class TodayEntryPipe implements PipeTransform {
  transform(entries: WheelOfLifeEntry<number>[]): WheelOfLifeEntry<number> | undefined {
    const today = formatISO(new Date(), { representation: 'date' })
    return entries.find(e => e.id === today)
  }
}

@Pipe({
  name: 'previous'  
})
export class PreviousEntryPipe implements PipeTransform {
  transform(entries: WheelOfLifeEntry<number>[]): WheelOfLifeEntry<number> | undefined {
    return getPreviousEntry(entries)
  }
}

@NgModule({
  declarations: [TodayEntryPipe, PreviousEntryPipe],
  exports: [TodayEntryPipe, PreviousEntryPipe]
})
export class EntryPipeModule {}