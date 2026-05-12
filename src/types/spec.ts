export interface ACItem {
  id: string
  given: string
  when: string
  then: string
}

export interface DataContractField {
  name: string
  type: string
  required: boolean
  constraint?: string
}

export interface DataContract {
  inputs: DataContractField[]
  outputs: DataContractField[]
}

export interface ChangeRecord {
  source: 'review_board' | 'gap_agent' | 'revision_engine' | 'signoff'
  timestamp: string
  description: string
  versionFrom: number
  versionTo: number
}

export interface MetaSpec {
  id: string
  version: number
  userStory: string
  acceptanceCriteria: ACItem[]
  dataContract: DataContract
  uxDraft: string
  status: 'draft' | 'ready_for_review' | 'in_review' | 'signed_off' | 'rework'
  changeTrace: ChangeRecord[]
}

export interface SignoffAction {
  action: 'approve' | 'reject'
  reviewerName: string
  timestamp: string
  comment?: string
}
