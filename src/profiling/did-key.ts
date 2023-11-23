import {DidVCActor} from "../components/solid-actor/DidVCActor";
import {runEvaluation} from "./evaluator";
import {DidVCActorFactory} from "../tests/ActorFactory";
import {profileMode, ProfileMode} from "./config";
import {runMultiActorEvaluation} from "./multi-actor";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {ITestRecord} from "../tests/interfaces";

export async function createInitializedActor(): Promise<DidVCActor> {
    const actorFactor =new DidVCActorFactory()
    return await actorFactor.createInitializedActor()
}

const actorFactory = new DidVCActorFactory()
switch (profileMode) {
    case ProfileMode.singleActor:
        const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
        actorFactory.createInitializedActor(r)
            .then(runEvaluation)
            .then()
            .catch(console.error)
        break
    case ProfileMode.multiActor:
        runMultiActorEvaluation(actorFactory)
            .then()
            .catch(console.error)
        break;
    default:
        throw new Error('Unknown Profile Mode')
}

