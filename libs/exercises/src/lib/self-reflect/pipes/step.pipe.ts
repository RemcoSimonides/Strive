import { Pipe, PipeTransform } from '@angular/core'
import { EntryStep, SelfReflectQuestionConfig } from '@strive/model'

@Pipe({ name: 'stepFilter', standalone: true })
export class SelfReflectStepFilterPipe implements PipeTransform {

  transform(questions: SelfReflectQuestionConfig[] | null, { step, tense }: EntryStep): SelfReflectQuestionConfig[] {
    if (!questions) return []
    return questions.filter(question => question.step === step && question.tense === tense)
  }
}