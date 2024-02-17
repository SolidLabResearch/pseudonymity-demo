import {IUseCaseActorsSetup} from "./interfaces";
import {SolidVCActorFactory, WebIdOnWebIdActorFactory} from "../factory/ActorFactory";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";

import {ICredentialActor} from "../interfaces/did";
import {ICompoundCredentialActor} from "../interfaces/actor";


export async function initializeUseCaseActorsForThirdPartyServiceSolution(dlco: DocumentLoaderCacheOptions): Promise<IUseCaseActorsSetup> {
    let alice: ICompoundCredentialActor = await new WebIdOnWebIdActorFactory(dlco).createInitializedActor(
        cssTestConfigRecords.find(r => r.testConfig.name === 'alice')!,
        cssTestConfigRecords.find(r => r.testConfig.name === 'pseudo')!
    )
    alice.tag = 'alice'
    alice.className = `${(alice as any).constructor.name}<${(alice.publicActor as any).constructor.name},${(alice.pseudonymousActor as any).constructor.name}>`

    // Initialize remaining actors
    const solidVcActorFactory = new SolidVCActorFactory(dlco)
    const remainingActors = Object.fromEntries(
        await Promise.all(
            cssTestConfigRecords
                // Filter out alice & pseudo
                .filter(r=>!['alice','pseudo'].includes(r.testConfig.name))
                .map(
            async (r) => {
                const actor: ICredentialActor = await solidVcActorFactory.createInitializedActor(r)
                actor.tag = r.testConfig.name
                actor.className = (actor as any).constructor.name
                return [r.testConfig.name, actor]
            }
        ))
    )


    return   {
        documentLoaderCacheOptions: dlco,
        alice,
        ...remainingActors
    } as IUseCaseActorsSetup
}

// async function run() {
//     const actors = await initializeUseCaseActorsForThirdPartyServiceSolution()
//     await runMultiActorEvaluationV2(actors,'tmp')
//
//     console.log(actors)
// }

// run().then().catch(console.error)
