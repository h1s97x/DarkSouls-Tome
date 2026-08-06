import type { GameVersion, ItemType } from '@/types/item'

export const GAME_NAMES: Record<GameVersion, string> = {
  1: '黑暗之魂',
  2: '黑暗之魂2',
  3: '黑暗之魂3'
}

export const ITEM_TYPE_NAMES: Record<ItemType, string> = {
  weapon: '武器',
  armor: '防具',
  ring: '戒指',
  item: '物品',
  magic: '法术'
}

export const ITEM_TYPE_NAMES_EN: Record<ItemType, string> = {
  weapon: 'Weapons',
  armor: 'Armors',
  ring: 'Rings',
  item: 'Items',
  magic: 'Magics'
}

export const LANGUAGE_LABELS = {
  chn: '中文',
  jap: '日本語',
  eng: 'English'
}
