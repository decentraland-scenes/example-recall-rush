import { Schemas, engine } from '@dcl/sdk/ecs'

export const SimonButton = engine.defineComponent('color-button', {
    name: Schemas.String,
    id: Schemas.Number,
    baseColor: Schemas.Color4,
    accentColor: Schemas.Color4,
    sound: Schemas.String,
    pressLength: Schemas.Number
})

export const GameData = engine.defineComponent('game-data', {
    playerAddress: Schemas.String,
    playerName: Schemas.String,
    moves: Schemas.Number,
    levelStartedAt: Schemas.Int64,
    levelFinishedAt: Schemas.Int64,
    currentLevel: Schemas.Number,
})

