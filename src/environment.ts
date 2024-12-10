import { ColliderLayer, engine, Entity, GltfContainer, MeshCollider, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

export let workstation: Entity
export let backSign: Entity
export let sceneParentEntity: Entity

export function initEnvironment() {

    sceneParentEntity = engine.addEntity()
    Transform.create(sceneParentEntity, {position: Vector3.create(8,0,8)})

    const sceneBase = engine.addEntity()
    Transform.create(sceneBase, { parent: sceneParentEntity })
    GltfContainer.create(sceneParentEntity, {
        src: "models/sceneBase.glb"
    })

    workstation = engine.addEntity()
    Transform.create(workstation, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 0.05, 3.8)
    })
    GltfContainer.create(workstation, {
        src: "models/workstation.glb"
    })

    backSign = engine.addEntity()
    Transform.create(backSign, {
        parent: sceneParentEntity,
        position: Vector3.create(-3.6, 3, -6.95)
    })

    const gameAreaCollider = engine.addEntity()

    Transform.create(gameAreaCollider, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 2.5, -2),
        scale: Vector3.create(11.7, 5, 10)
    })

    MeshCollider.setBox(gameAreaCollider, ColliderLayer.CL_PHYSICS)
}