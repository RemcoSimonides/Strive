import { Pipe, PipeTransform } from '@angular/core'
import { SelfReflectInterval, SelfReflectSettings } from '@strive/model'

@Pipe({ name: 'isActivated', standalone: true })
export class SelfReflectQuestionActivatedPipe implements PipeTransform {

  transform(settings: SelfReflectSettings, interval: SelfReflectInterval | undefined, question: keyof Omit<SelfReflectSettings, "id" | "createdAt" | "updatedAt"> | undefined): boolean {
    if (!question) throw new Error('No question provided')
    if (!interval) throw new Error('No interval provided')

    return settings[question] === interval
  }
}