import { ColliderLayer, engine, Entity, GltfContainer, InputModifier, MainCamera, Transform, VirtualCamera, VisibilityComponent } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { movePlayerTo } from "~system/RestrictedActions"
import { BOARD_POSITION, PLAYER_POSITION, SPECTATOR_POSITION } from "."

let lockPos: Vector3
let boardPos: Vector3

var customCameraEnt: Entity

export function lockPlayer(){
    
    lockPos = PLAYER_POSITION
    boardPos = BOARD_POSITION
    
    movePlayerTo({
        newRelativePosition: lockPos,
        cameraTarget: boardPos,
    })

    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: true
          }
        }
      })

}

export function unlockPlayer(){

    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: false
          }
        }
      })


    let unlockPos = SPECTATOR_POSITION
    
    movePlayerTo({ newRelativePosition: unlockPos, cameraTarget: BOARD_POSITION }) 
}

export function initCamera() {
    try {
        if(!customCameraEnt) {
            customCameraEnt = engine.addEntity()
            Transform.create(customCameraEnt, {
                position: Vector3.add(PLAYER_POSITION, {x: 0, y: 0.5, z: 0.25}),
                rotation: Quaternion.fromEulerDegrees(0,180,0)
            })
            VirtualCamera.create(customCameraEnt, {
                defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0.5) },
            })
        }
    } catch (error) {
        console.error(error); 
    }
}

export function lockCamera() {
    try {
        MainCamera.createOrReplace(engine.CameraEntity, {
            virtualCameraEntity: customCameraEnt,
        })
        
    } catch (error) {
        console.error(error); 
    }
}
export function unlockCamera() {
    try {
        MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined
    } catch (error) {
        console.error(error); 
    }
}