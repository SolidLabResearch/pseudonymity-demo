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

export async function createInitializedActor(): Promise<SolidVCActor> {
    const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
    // Build record
    // Register users & pods, and get each actor's controls object
    r.controls = await register(r.userConfig)
    // Obtain client credentials
    r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
    // Attach initialized SolidVCActor
    const documentLoader = createCustomDocumentLoader(ctx)
    const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
    // Determine URL for DIDs container, based on the pod url
    const didsContainer = joinUrlPaths(proxy.podUrl!, 'dids') + '/';
    const controllerId = joinUrlPaths(didsContainer, 'controller')
    // Generate BLS12381 G2 Key using a seed
    const seed = Uint8Array.from(Buffer.from('testseed'))
    const keyName = "key"
    const keyId = `${controllerId}#${keyName}`;
    const key = await Bls12381G2KeyPair.generate({
        id: keyId,
        seed,
        controller: controllerId
    })

    const a = new SolidVCActor(key, keyName, documentLoader, proxy)
    await a.initialize()
    return a;
}

createInitializedActor()
    .then(runEvaluation)
    .then()
    .catch(console.error)
