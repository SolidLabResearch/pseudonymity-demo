import {DidVCActor} from "../components/solid-actor/DidVCActor";
import {runEvaluation} from "./evaluator";
import {DidVCActorFactory} from "../tests/ActorFactory";

export async function createInitializedActor(): Promise<DidVCActor> {
    const actorFactor =new DidVCActorFactory()
    return await actorFactor.createInitializedActor()
}

createInitializedActor()
    .then(runEvaluation)
    .then()
    .catch(console.error)
