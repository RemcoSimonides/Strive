export interface ListEntries {
  entries: string[]
}

export function createListEntries(params?: Partial<ListEntries>): ListEntries {
  return {
    entries: params?.entries ?? []
  }
}