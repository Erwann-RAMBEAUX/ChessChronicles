import BulletCmp from '../assets/icons/game-time-bullet.svg?component'
import BlitzCmp from '../assets/icons/game-time-blitz.svg?component'
import RapidCmp from '../assets/icons/game-time-rapid.svg?component'
import DailyCmp from '../assets/icons/game-time-daily.svg?component'
import PuzzleCmp from '../assets/icons/game-type-puzzle.svg?component'
import PuzzleRushCmp from '../assets/icons/game-type-puzzle-rush.svg?component'

import BulletRaw from '../assets/icons/game-time-bullet.svg?raw'
import BlitzRaw from '../assets/icons/game-time-blitz.svg?raw'
import RapidRaw from '../assets/icons/game-time-rapid.svg?raw'
import DailyRaw from '../assets/icons/game-time-daily.svg?raw'
import PuzzleRaw from '../assets/icons/game-type-puzzle.svg?raw'
import PuzzleRushRaw from '../assets/icons/game-type-puzzle-rush.svg?raw'

export const Icons = {
  bullet: { component: BulletCmp, raw: BulletRaw },
  blitz: { component: BlitzCmp, raw: BlitzRaw },
  rapid: { component: RapidCmp, raw: RapidRaw },
  daily: { component: DailyCmp, raw: DailyRaw },
  puzzle: { component: PuzzleCmp, raw: PuzzleRaw },
  puzzleRush: { component: PuzzleRushCmp, raw: PuzzleRushRaw }
} as const

export type IconKey = keyof typeof Icons
