import {createCustomDocumentLoader, ctx} from "../contexts/contexts";
import {SolidVCActor} from "../components/solid-actor/SolidVCActor";
import {ITestRecord} from "../tests/interfaces";
import {CssProxy} from "../components/solid-actor/CssProxy";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../utils/css";
import {evaluate} from "./evaluator";

async function createInitializedActor(): Promise<SolidVCActor> {
    const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
    // Build record
    // Register users & pods, and get each actor's controls object
    r.controls = await register(r.userConfig)
    // Obtain client credentials
    r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
    // Attach initialized SolidVCActor
    const documentLoader = createCustomDocumentLoader(ctx)
    const actor = new SolidVCActor(
        new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
        , r.userConfig.webId, documentLoader)
    await actor.initialize()
    return actor;
}

createInitializedActor()
    .then(evaluate)
    .then()
    .catch(console.error)
