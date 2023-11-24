import {ITestRecord} from "../tests/interfaces";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {runEvaluation} from "./evaluator";
import {SolidVCActorFactory} from "../tests/ActorFactory";
import {documentLoaderCacheOptions, nIterations, ProfileMode, profileMode} from "./config";
import {runMultiActorEvaluation} from "./multi-actor";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";


switch (profileMode) {
    case ProfileMode.singleActor:
        const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
        const actorFactory = new SolidVCActorFactory(documentLoaderCacheOptions)
        actorFactory.createInitializedActor(r)
            .then(runEvaluation)
            .then()
            .catch(console.error)
        break
    case ProfileMode.multiActor:
        (async () => {
            const dlcOptions = {
                HTTP: {
                    cacheWebResourcesResolvedFromLocalHostInstances: false,
                    cacheWebResourcesResolvedFromTheWeb: false
                },
                DID: {cacheResolvedDIDDocs: false}

            } as DocumentLoaderCacheOptions
            const actorFactory = new SolidVCActorFactory(documentLoaderCacheOptions)
            for(let i = 0; i< nIterations; i++) {
                await runMultiActorEvaluation(actorFactory)
            }

        })().then()
            .catch(console.error)
        break;
    default:
        throw new Error('Unknown Profile Mode')
}
