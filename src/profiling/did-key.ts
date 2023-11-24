import {DidVCActor} from "../components/solid-actor/DidVCActor";
import {runEvaluation} from "./evaluator";
import {DidVCActorFactory, SolidVCActorFactory} from "../tests/ActorFactory";
import {documentLoaderCacheOptions, nIterations, profileMode, ProfileMode} from "./config";
import {runMultiActorEvaluation} from "./multi-actor";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {ITestRecord} from "../tests/interfaces";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";




switch (profileMode) {
    case ProfileMode.singleActor:
        const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
        const actorFactory = new DidVCActorFactory(documentLoaderCacheOptions)
        actorFactory.createInitializedActor(r)
            .then(runEvaluation)
            .then()
            .catch(console.error)
        break
    case ProfileMode.multiActor:
        (async () => {
            const actorFactory = new DidVCActorFactory(documentLoaderCacheOptions)
            for(let i = 0; i< nIterations; i++) {
                await runMultiActorEvaluation(actorFactory)
            }

        })().then()
            .catch(console.error)

        break;
    default:
        throw new Error('Unknown Profile Mode')
}

