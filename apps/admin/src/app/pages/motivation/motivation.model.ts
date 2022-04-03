export interface Motivations {
  quotes: Motivation[]
}

export interface Motivation {
  quote: string;
  from: string;
  used: boolean;
}