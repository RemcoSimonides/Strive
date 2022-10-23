import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { WheelOfLifeEntry } from "@strive/model";
import { formatISO } from "date-fns";

@Pipe({
  name: 'today'
})
export class TodayEntryPipe implements PipeTransform {
  transform(entries: WheelOfLifeEntry<number>[]): WheelOfLifeEntry<number> | undefined {
    const today = formatISO(new Date(), { representation: 'date' })
    return entries.find(e => e.id === today)
  }
}

@NgModule({
  declarations: [TodayEntryPipe],
  exports: [TodayEntryPipe]
})
export class EntryPipeModule {}