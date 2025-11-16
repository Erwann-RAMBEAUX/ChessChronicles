import PuzzleRushCmp from '../assets/icons/game-type-puzzle-rush.svg?component'
import PuzzleRushRaw from '../assets/icons/game-type-puzzle-rush.svg?raw'

export const Icons = {
  puzzleRush: { component: PuzzleRushCmp, raw: PuzzleRushRaw },
} as const

export type IconKey = keyof typeof Icons
