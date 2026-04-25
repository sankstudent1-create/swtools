export type TermKey = '1' | '2' | '3' | '5'

export interface EntryRow {
  id: number
  acc: string
  pr: string
  name: string
  dep: string
  term: TermKey | ''
  rate: string
  inc: string
}

export interface OfficeDetails {
  bo: string
  so: string
  ho: string
  month: string
  dated: string
}
