import { engine, Entity, TextAlignMode, TextShape, Transform } from "@dcl/sdk/ecs"
import { gameDataEntity } from "./game"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { backSign } from "./environment"
import { GameData } from "./components"

let movesEntity: Entity
let playerNameEntity: Entity

export function initStatusBoard() {
    movesEntity = engine.addEntity()
    playerNameEntity = engine.addEntity()

    Transform.create(movesEntity, {
        parent: backSign,
        position: Vector3.create(0, -0.5, 0),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })

    Transform.create(playerNameEntity, {
        parent: backSign,
        position: Vector3.create(0, 0, 0),
        rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    })

    let elapsedTime = 0
    const gameLoopPeriod = 0.3

    engine.addSystem((dt: number) => {
        elapsedTime += dt

        if (elapsedTime >= gameLoopPeriod) {
            elapsedTime = 0
            updateTexts()
        }
    })
}

function updateTexts() {
    const gameData = GameData.getOrNull(gameDataEntity)

    const empty = !gameData?.playerName
    // if (!gameData?.playerName) return

    TextShape.createOrReplace(playerNameEntity, {
        text: empty ? "" : `${gameData.playerName}`,
        fontSize: 3,
        textAlign: TextAlignMode.TAM_TOP_LEFT,
        textColor: Color4.White()
    })

    TextShape.createOrReplace(movesEntity, {
        text: empty ? "" : `Steps: ${gameData.moves}`,
        fontSize: 3,
        textAlign: TextAlignMode.TAM_TOP_LEFT,
        textColor: Color4.White()
    })
}