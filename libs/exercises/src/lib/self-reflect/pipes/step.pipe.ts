import { Pipe, PipeTransform } from '@angular/core'
import { EntryStep, SelfReflectQuestionConfig } from '@strive/model'

@Pipe({ name: 'stepFilter', standalone: true })
export class SelfReflectStepFilterPipe implements PipeTransform {

  transform(questions: SelfReflectQuestionConfig[] | null, { category, tense }: EntryStep): SelfReflectQuestionConfig[] {
    if (!questions) return []
    return questions.filter(question => question.category === category && question.tense === tense)
  }
}