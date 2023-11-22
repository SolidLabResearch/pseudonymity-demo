import {createCustomDocumentLoader, ctx} from "../contexts/contexts";
import {ITestRecord} from "../tests/interfaces";
import {CssProxy} from "../components/solid-actor/CssProxy";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../utils/css";
import {runEvaluation} from "./evaluator";
import path from "path";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {SolidVCActor} from "../components/solid-actor/SolidVCActor";
import {joinUrlPaths} from "../utils/url";
import {SolidVCActorFactory} from "../tests/ActorFactory";

export async function createInitializedActor(): Promise<SolidVCActor> {
    const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
    // Build record
    // Register users & pods, and get each actor's controls object
    r.controls = await register(r.userConfig)
    // Obtain client credentials
    r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
    const actorFactory = new SolidVCActorFactory()
    return await actorFactory.createInitializedActor(r)
}

createInitializedActor()
    .then(runEvaluation)
    .then()
    .catch(console.error)
