import { createSupportSource, SupportSource } from '@strive/model'

export type SupportDecision = 'give' | 'keep'
export type SupportStatus = 'open' | 'rejected' | 'canceled' | 'waiting_to_be_paid' | 'paid'

export interface SupportLink {
  id: string
  description: string
}

export interface Support {
  id?: string
  amount?: number
  description: string
  status: SupportStatus
  needsDecision: Date | false
  source: SupportSource
  updatedAt?: Date
  createdAt?: Date
}

export function createSupport(params: Partial<Support> = {}): Support {
  return {
    id: '',
    description: '',
    status: 'open',
    needsDecision: false,
    source: createSupportSource(params.source),
    ...params
  }
}

export function createSupportLink(params: Partial<Support | SupportLink> = {}): SupportLink {
  return {
    id: params.id ?? '',
    description: params.description ?? ''
  }
}