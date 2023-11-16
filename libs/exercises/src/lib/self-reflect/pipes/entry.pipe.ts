import { Pipe, PipeTransform } from '@angular/core'
import { SelfReflectEntry, SelfReflectQuestion } from '@strive/model'

@Pipe({ name: 'filterEntries', standalone: true })
export class SelfReflectFilterEntriesPipe implements PipeTransform {

  transform(entries: SelfReflectEntry[] | null, key: keyof SelfReflectEntry): SelfReflectEntry[] {
    if (!entries) return []

    return entries.filter(entry => {
      if (!entry[key]) return false
      if (Array.isArray(entry[key])) return (entry[key] as string[] | SelfReflectQuestion[]).length
      return entry[key]
    })
  }
}