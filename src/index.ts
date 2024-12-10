// We define the empty imports so the auto-complete feature works as expected.
import { Vector3 } from '@dcl/sdk/math'
import { initGame } from './game'
import { initEnvironment } from './environment'

export const PLAYER_POSITION = Vector3.create(8, 1, 8)
export const SPECTATOR_POSITION = Vector3.create(4.4, 0, 14.5)
export const BOARD_POSITION = Vector3.create(8, 2, 0)

export function main() {
  initEnvironment()
  initGame()
}
