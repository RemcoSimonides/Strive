import { Pipe, PipeTransform } from '@angular/core'
import { SelfReflectFrequency, SelfReflectSettings } from '@strive/model'

@Pipe({ name: 'isActivated', standalone: true })
export class SelfReflectQuestionActivatedPipe implements PipeTransform {

  transform(settings: SelfReflectSettings, frequency: SelfReflectFrequency | undefined, question: keyof Omit<SelfReflectSettings, "id" | "createdAt" | "updatedAt"> | undefined): boolean {
    if (!question) throw new Error('No question provided')
    if (!frequency) throw new Error('No frequency provided')

    return settings[question] === frequency
  }
}