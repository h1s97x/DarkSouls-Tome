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

// 各游戏各类型的物品数量
export const ITEM_COUNTS: Record<GameVersion, Record<ItemType, number>> = {
  1: {
    weapon: 198,
    armor: 245,
    ring: 44,
    item: 144,
    magic: 72
  },
  2: {
    weapon: 374,
    armor: 481,
    ring: 77,
    item: 205,
    magic: 125
  },
  3: {
    weapon: 321,
    armor: 394,
    ring: 80,
    item: 241,
    magic: 108
  }
}
