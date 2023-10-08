import { Pipe, PipeTransform } from '@angular/core'
import { AssessLifeInterval, AssessLifeSettings } from '@strive/model'

@Pipe({ name: 'isActivated', standalone: true })
export class AssessLifeQuestionActivatedPipe implements PipeTransform {

  transform(settings: AssessLifeSettings, interval: AssessLifeInterval | undefined, question: keyof Omit<AssessLifeSettings, "id" | "createdAt" | "updatedAt"> | undefined): boolean {
    if (!question) throw new Error('No question provided')
    if (!interval) throw new Error('No interval provided')

    const setting = settings[question]
    return setting === interval
  }
}