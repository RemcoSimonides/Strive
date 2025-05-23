export interface Affirmations {
  id?: string
  times: string[]
  affirmations: string[]
  createdAt?: Date
  updatedAt?: Date
}

export function createAffirmation(data: Partial<Affirmations> = {}): Affirmations {
  return {
    id: data.id,
    times: data.times || [],
    affirmations: data.affirmations || [],
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date()
  }
}

export interface AffirmationSuggestion {
  affirmation: string,
  category: enumAffirmationCategory
}

export enum enumAffirmationCategory {
  all,
  health,
  personal_development,
  motivation,
  positive_mindset,
  money,
  love,
}

export const affirmationSuggestions: AffirmationSuggestion[] = [
  { affirmation: 'I eat well, exercise regularly and get plenty of rest to enjoy good health', category: enumAffirmationCategory.health },
  { affirmation: 'I am what I eat', category: enumAffirmationCategory.health },
  { affirmation: 'I eat healthy nutritious food that benefits my body', category: enumAffirmationCategory.health },
  { affirmation: 'I take care of my body', category: enumAffirmationCategory.health },
  { affirmation: 'I trust the signals my body sends me', category: enumAffirmationCategory.health },
  { affirmation: 'I love every cell in my body', category: enumAffirmationCategory.health },
  { affirmation: 'I am surrounded by people who encourage me to be healthy', category: enumAffirmationCategory.health },
  { affirmation: 'I manifest perfect health by making smart choices', category: enumAffirmationCategory.health },
  { affirmation: 'I look forward to a healthy old age because I take loving care of my body now', category: enumAffirmationCategory.health },
  { affirmation: 'I am pain free and completely in sync with life', category: enumAffirmationCategory.health },
  { affirmation: 'I am grateful for my healthy body', category: enumAffirmationCategory.health },
  { affirmation: 'I am grateful to be alive', category: enumAffirmationCategory.health },
  { affirmation: 'I learn from my mistakes', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I know I can accomplish anything I set my mind to', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I turn obstacles into learning opportunities', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I stand up for my beliefs, values and morals', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I treat others with respect and appreciate their individuality', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I contribute my talents and knowledge for the good of all', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I make a difference whenever I can', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I value my time and input', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I endeavor to be the best that I can be', category: enumAffirmationCategory.personal_development },
  { affirmation: 'I never give up', category: enumAffirmationCategory.motivation },
  { affirmation: 'I support and encourage others', category: enumAffirmationCategory.motivation },
  { affirmation: 'I can accomplish anything', category: enumAffirmationCategory.motivation },
  { affirmation: 'I will continue till I achieve my goals', category: enumAffirmationCategory.motivation },
  { affirmation: 'I enjoy challanges. I take them head on and win over them', category: enumAffirmationCategory.motivation },
  { affirmation: 'Motivation comes to me from inside', category: enumAffirmationCategory.motivation },
  { affirmation: 'The only option for me is success', category: enumAffirmationCategory.motivation },
  { affirmation: 'I am a winner', category: enumAffirmationCategory.motivation },
  { affirmation: 'Life is good!', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'Live and let live', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'Live is what I make it', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I live each day to the fullest', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I know, accept, and am true to myself', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I believe in, trust, and have confidence in myself', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I am a unique and worthy person', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I respect myself', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I accept what I cannot change', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I look for humor and fun in as many situations as possible', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I enjoy life to the fullest', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I focus on the positive', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I have control over my thoughts, feelings and choices', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I have a lot to offer', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'I appreciate all the good things in life', category: enumAffirmationCategory.positive_mindset },
  { affirmation: 'Money comes to me easily and effortlessly', category: enumAffirmationCategory.money },
  { affirmation: 'Wealth constantly flows into my life', category: enumAffirmationCategory.money },
  { affirmation: 'My actions create constant prosperity', category: enumAffirmationCategory.money },
  { affirmation: 'I am aligned with the energy of abundance', category: enumAffirmationCategory.money },
  { affirmation: 'I am a magnet for money', category: enumAffirmationCategory.money },
  { affirmation: 'I am worthy of making more money', category: enumAffirmationCategory.money },
  { affirmation: 'Money creates positive impact in my life', category: enumAffirmationCategory.money },
  { affirmation: 'Money comes to me in expected and unexpected ways', category: enumAffirmationCategory.money },
  { affirmation: 'I take pleasure in my own solitude', category: enumAffirmationCategory.love },
  { affirmation: 'I love and approve myself', category: enumAffirmationCategory.love },
  { affirmation: 'I am loved', category: enumAffirmationCategory.love },
  { affirmation: 'I am surrounded by love', category: enumAffirmationCategory.love },
  { affirmation: 'My heart is always open and I radiate love', category: enumAffirmationCategory.love },
  { affirmation: 'All my relationships are long-lasting and loving', category: enumAffirmationCategory.love },
  { affirmation: 'I see everything with loving eyes and I love everything I see', category: enumAffirmationCategory.love },
  { affirmation: 'I have attracted the most loving person in my life and my life is now full of joy', category: enumAffirmationCategory.love },
  { affirmation: 'My partner is the love of my life and the center of the universe', category: enumAffirmationCategory.love },
  { affirmation: 'My partner loves me as much as I love him', category: enumAffirmationCategory.love },
  { affirmation: 'I understand my partner perfectly as I am able to see his/her point of view', category: enumAffirmationCategory.love },
  { affirmation: 'I always express my feelings openly to my partner', category: enumAffirmationCategory.love },
  { affirmation: 'I give out love and it is returned to me multiplied many fold', category: enumAffirmationCategory.love },
]