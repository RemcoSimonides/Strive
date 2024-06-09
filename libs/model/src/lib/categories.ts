export type Category = 'career' | 'creative' | 'education' | 'environment' | 'financial' | 'health_fitness' | 'other' | 'personal_development' | 'relationship' | 'spiritual' | 'travel_adventure'

export interface CategoryBlock {
  id: Category
  title: string
  image: string
}

export const categories: CategoryBlock[] = [
  {
    id: 'career',
    title: 'Career',
    image: 'category_career.png'
  },
  {
    id: 'creative',
    title: 'Creative',
    image: 'category_creative.png'
  },
  {
    id: 'education',
    title: 'Education',
    image: 'category_education.png'
  },
  {
    id: 'environment',
    title: 'Environment',
    image: 'category_environment.png'
  },
  {
    id: 'financial',
    title: 'Financial',
    image: 'category_financial.png'
  },
  {
    id: 'health_fitness',
    title: 'Health & Fitness',
    image: 'category_health_and_fitness.png'
  },
  {
    id: 'personal_development',
    title: 'Personal Development',
    image: 'category_personal_development.png'
  },
  {
    id: 'relationship',
    title: 'Relationship',
    image: 'category_relationship.png'
  },
  {
    id: 'spiritual',
    title: 'Spiritual',
    image: 'category_spiritual.png'
  },
  {
    id: 'travel_adventure',
    title: 'Travel & Adventure',
    image: 'category_travel_and_adventure.png'
  },
  {
    id: 'other',
    title: 'Other',
    image: 'category_other.png'
  }
]