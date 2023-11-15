import { Pipe, PipeTransform } from '@angular/core'
import { EntryStep, SelfReflectQuestion } from '@strive/model'

@Pipe({ name: 'stepFilter', standalone: true })
export class SelfReflectStepFilterPipe implements PipeTransform {

  transform(questions: SelfReflectQuestion[] | null, { category, tense }: EntryStep): SelfReflectQuestion[] {
    if (!questions) return []
    return questions.filter(question => question.category === category && question.tense === tense)
  }
}