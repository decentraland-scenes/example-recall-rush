import { engine, Transform, pointerEventsSystem, InputAction, TransformType, AudioSource, Entity, GltfContainer, Animator, ColliderLayer } from "@dcl/sdk/ecs"
import { Vector3, Quaternion } from "@dcl/sdk/math"
import { GameData, SimonButton } from "./components"
import { backSign, sceneParentEntity, workstation } from "./environment"
import { getPlayer } from "@dcl/sdk/players"
import { initStatusBoard } from "./statusBoard"
import { lockCamera, unlockCamera, initCamera, lockPlayer, unlockPlayer } from "./lockPlayer"
import * as ui from "./ui"

const buttonsData = [
    {
        id: 1, name: 'red',
        sound: "sounds/button1.mp3",
        modelSrc: "models/buttonRed.glb"
    },
    {
        id: 2, name: 'green',
        sound: "sounds/button2.mp3",
        modelSrc: "models/buttonGreen.glb"
    },
    {
        id: 3, name: 'yellow',
        sound: "sounds/button3.mp3",
        modelSrc: "models/buttonYellow.glb"
    },
    {
        id: 4, name: 'blue',
        sound: "sounds/button4.mp3",
        modelSrc: "models/buttonBlue.glb"
    },
]

let level = 1
let attemp = 0
let powerOn = false
let sequence: number[] = []
let userSequence: number[] = []
const sounds = engine.addEntity()
Transform.create(sounds, { parent: engine.CameraEntity })
let timer: ui.Timer3D
let enableSound = true

// const startButton = engine.addEntity()
export let gameDataEntity: Entity

export function initGame() {

    initPlayerData()
    initUiButtons()
    initSimonButtons()
    initCountdownNumbers()
    initStatusBoard()
    initCamera()

    new ui.MenuButton(
        {
            parent: sceneParentEntity,
            position: Vector3.create(0, 1.07, 3.95),
            rotation: Quaternion.fromEulerDegrees(-30, 180, 0),
            scale: Vector3.create(1.2, 1.2, 1.2)
        },
        ui.uiAssets.shapes.RECT_GREEN,
        ui.uiAssets.icons.playText,
        "PLAY GAME",
        () => {
            getReadyToStart()
        }
    )

}


function endGame() {
    GameData.createOrReplace(gameDataEntity, { playerAddress: '', playerName: '', currentLevel: -1 })
    // gameOverAnimation()
    powerOn = false
    userSequence = []
    disableButtons()
}

function initPlayerData() {

    gameDataEntity = engine.addEntity()
    GameData.createOrReplace(gameDataEntity, { playerAddress: '', playerName: '', currentLevel: -1 })

}

function initUiButtons() {

    new ui.MenuButton(
        {
            parent: backSign,
            position: Vector3.create(7.5, 0, 0.15),
            scale: Vector3.create(2.4, 2.4, 2.4),
            rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
        },
        ui.uiAssets.shapes.RECT_RED,
        ui.uiAssets.icons.exitText,
        'Exit from game area',
        () => {
            unlockCamera()
            unlockPlayer()
        }
    )

    const soundButton = new ui.MenuButton(
        {
            parent: backSign,
            position: Vector3.create(7.25, -0.7, 0.15),
            scale: Vector3.create(2.4, 2.4, 2.4),
            rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
        },
        ui.uiAssets.shapes.SQUARE_RED,
        ui.uiAssets.icons.sound,
        'Mute sounds',
        () => {
            enableSound = !enableSound
            if (enableSound) {
                soundButton.changeIcon(ui.uiAssets.icons.sound)
            } else {
                soundButton.changeIcon(ui.uiAssets.icons.close)
            }
        }
    )
}

function initSimonButtons() {
    for (const button of buttonsData) {

        const entity = engine.addEntity()

        Transform.create(entity, { parent: sceneParentEntity, position: Vector3.create(0, 2.62395, -6.95) })

        GltfContainer.create(entity, {
            src: button.modelSrc,
            invisibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
        })

        Animator.create(entity, {
            states: [
                {
                    clip: "Animation",
                    playing: false,
                    loop: false
                }
            ]
        })

        SimonButton.create(entity, {
            name: button.name,
            id: button.id,
            sound: button.sound,
        })

    }
}

function initCountdownNumbers() {
    timer = new ui.Timer3D({
        parent: sceneParentEntity,
        position: Vector3.create(0, 2.4, -4),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    }, 1, 1, false, 10)

    timer.hide()
}

function getReadyToStart() {

    enableSound && AudioSource.createOrReplace(sounds, {
        audioClipUrl: "sounds/pre_countdown.mp3",
        playing: true
    })

    // let timer = 4
    // engine.addSystem((dt: number) => {
        // timer -= dt
        // if (timer > 0) return

        lockPlayer()
        lockCamera()
        powerOn = true
        startGame(1)
        // engine.removeSystem('timer-get-ready')

    // }, undefined, 'timer-get-ready')
}

function gameOverAnimation(restartLevel = 0) {
    endGame()
    //play loose sound
    enableSound && AudioSource.createOrReplace(sounds, {
        audioClipUrl: "sounds/gameOver.mp3",
        playing: true
    })


    const buttons = [...engine.getEntitiesWith(SimonButton)]

    let i = 0
    let timer = 0

    //button loop fast
    engine.addSystem((dt: number) => {
        timer += dt
        if (timer < 0.4) return
        timer = 0

        if (i < buttons.length) {
            pressButton(buttons[i][1].id, 20, true)
            i++
        } else {
            restartLevel !== 0 && startGame(restartLevel)
            engine.removeSystem('game-over')
        }
    }, undefined, 'game-over')

    //repeat button loop for x seconds
}


function startGame(level?: number) {
    console.log("start game")

    enableSound && AudioSource.createOrReplace(sounds, {
        audioClipUrl: "sounds/countdown.mp3",
        playing: true
    })

    const localPlayer = getPlayer()
    const playerData = GameData.getMutable(gameDataEntity)
    playerData.currentLevel = level ?? 1
    playerData.moves = 0
    playerData.levelStartedAt = 0
    playerData.levelFinishedAt = 1

    if (localPlayer) {
        playerData.playerName = localPlayer.name
    }

    powerOn = true


    countdown(() => {

        playerData.levelStartedAt = Date.now()
        playerData.levelFinishedAt = 0

        sequence = []
        userSequence = []
        level = level ? level : 1
        // levelCount.textContent = level;
        nextRound();
    }, 4)
}

function nextRound() {
    console.log('next round')
    addToSequence();
    playSequence();
}

function addToSequence() {
    const randomColor = Math.floor(Math.random() * 4) + 1;
    sequence.push(randomColor);
    GameData.getMutable(gameDataEntity).moves = sequence.length
    // console.log(sequence)
}

function playSequence() {
    let i = 0;

    disableButtons()

    // const period = 1 / level
    const period = 1
    let timer = period / 2
    engine.addSystem(dt => {
        timer += dt
        if (timer >= period) {
            timer = 0

            if (i < sequence.length) {
                pressButton(sequence[i], sequence.length)
                i++;
            } else {
                engine.removeSystem("interval")
                enableButtons()
            }
        }
    }, undefined, "interval")
}

function handleClick(id: number) {

    if (powerOn) {
        userSequence.push(id)
        pressButton(id, sequence.length, !checkSequence())

        if (!checkSequence()) {
            // console.log("simon: fail check sequence")
            if (sequence.length < 4 && attemp < 2) {
                //another chance
                attemp++
                gameOverAnimation(level)
            } else {
                gameOverAnimation()
                attemp = 0
                unlockPlayer()
                unlockCamera()
            }
        } else if (userSequence.length === sequence.length) {
            userSequence = [];
            let timer = 0
            engine.addSystem(dt => {
                timer += dt
                if (timer >= 1) {
                    nextRound()
                    timer = 0
                    engine.removeSystem('wait1')
                }
            }, undefined, "wait1")
        }
    }
}

function checkSequence() {
    for (let i = 0; i < userSequence.length; i++) {
        if (userSequence[i] !== sequence[i]) {
            return false;
        }
    }
    return true;
}

function pressButton(id: number, sequenceLength = 0.1, muted = false) {
    // console.log("highlightButton: ", id)

    const [entity, button] = [...engine.getEntitiesWith(SimonButton)].find(([entity, data]) => data.id === id) || []
    if (!(entity && button)) return

    let speed = 1
    if (sequenceLength > 20) {
        speed = 2
    } else {
        speed = 1 + sequenceLength * 0.05
    }

    !muted && AudioSource.stopSound(sounds)
    enableSound && !muted && AudioSource.createOrReplace(sounds, {
        audioClipUrl: button.sound,
        playing: true,
        loop: false,
        currentTime: 0,
        volume: 1,
        pitch: 1
    })

    Animator.createOrReplace(entity, {
        states: [
            {
                clip: "Animation",
                playing: true,
                loop: false,
                speed
            }
        ]
    })
}

function enableButtons() {
    console.log("enable buttons")


    const simonButtons = engine.getEntitiesWith(SimonButton)

    for (const [entity, button] of simonButtons) {
        // console.log("enable button: ", button.id)
        pointerEventsSystem.onPointerDown(
            {
                entity: entity,
                opts: {
                    button: InputAction.IA_POINTER,
                    hoverText: `PLAY ${button.name.toUpperCase()} NOTE`,
                    maxDistance: 12
                }
            },
            () => { handleClick(button.id) }
        )
    }
}

function disableButtons() {
    console.log("disable buttons")
    const buttons = engine.getEntitiesWith(SimonButton)

    for (const [entity] of buttons) {
        pointerEventsSystem.removeOnPointerDown(entity)
    }
}

async function countdown(cb: () => void, number: number) {

    let currentValue = number
    let time = 1

    engine.addSystem((dt: number) => {
        time += dt

        if (time >= 1) {
            time = 0

            if (currentValue > 0) {
                timer.show()
                timer.setTimeAnimated(currentValue--)
            } else {
                timer.hide()
                engine.removeSystem("countdown-system")
                cb && cb()
            }

        }
    }, undefined, "countdown-system")
}