import {ITestRecord} from "../tests/interfaces";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {runEvaluation} from "./evaluator";
import {SolidVCActorFactory} from "../tests/ActorFactory";
import {ProfileMode, profileMode} from "./config";
import {runMultiActorEvaluation} from "./multi-actor";

const actorFactory = new SolidVCActorFactory(true)
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
