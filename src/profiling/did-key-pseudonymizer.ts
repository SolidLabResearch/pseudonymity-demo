import {IUseCaseActorsSetup} from "./interfaces";
import {defaultDocumentLoaderCacheOptions} from "../tests/config/contextmap";
import {SolidVCActorFactory, WebIdOnDidKeyActorFactory} from "../tests/ActorFactory";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";

import {ICredentialActor} from "../interfaces/did";
import {ICompoundCredentialActor} from "../interfaces/actor";

export async function initializeUseCaseActorsForDidKeySolution(dlco: DocumentLoaderCacheOptions): Promise<IUseCaseActorsSetup> {
    let alice: ICompoundCredentialActor = await new WebIdOnDidKeyActorFactory(dlco).createInitializedActor(
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
