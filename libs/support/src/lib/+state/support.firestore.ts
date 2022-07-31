import { createSupportSource, SupportSource } from '@strive/notification/+state/notification.firestore'

export type SupportDecision = 'give' | 'keep'
export type SupportStatus = 'open' | 'rejected' | 'canceled' | 'waiting_to_be_paid' | 'paid'

export function getStatusLabel(support: Support) {
  const label: Record<SupportStatus, string> = {
    open: '',
    rejected: 'Rejected',
    canceled: 'Canceled',
    waiting_to_be_paid: 'Waiting to be paid',
    paid: 'Given'
  }

  if (support.status === 'open') {
    return support.source.milestone?.id
      ? 'Waiting for milestone to be completed'
      : 'Waiting for goal to be completed'
  } else {
    return label[support.status]
  }
}

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
    id: params.id ? params.id : '',
    description: '',
    status: 'open',
    needsDecision: false,
    source: createSupportSource(params?.source),
    ...params
  }
}

export function createSupportLink(params: Partial<Support | SupportLink> = {}): SupportLink {
  return {
    id: params.id,
    description: params.description
  }
}