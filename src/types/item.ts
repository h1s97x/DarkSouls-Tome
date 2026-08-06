export type GameVersion = 1 | 2 | 3
export type ItemType = 'weapon' | 'armor' | 'ring' | 'item' | 'magic'
export type Language = 'chn' | 'jap' | 'eng'

export interface MultiLangText {
  chn: string
  jap: string
  eng: string
}

export interface Item {
  id: string
  type: ItemType
  game: GameVersion
  name: MultiLangText
  description: MultiLangText
  remark?: MultiLangText
  icon: string
}

export interface DialogueLine {
  index: number
  chn: string
  jap: string
  eng: string
  isUnused?: boolean
  isTitle?: boolean
}

export interface Dialogue {
  npc: string
  game: GameVersion
  avatar: string
  lines: DialogueLine[]
}
