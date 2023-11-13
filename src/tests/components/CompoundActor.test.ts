import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {cssTestConfigRecords} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";
import {CssProxy} from "../../components/solid-actor/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {createCustomDocumentLoader} from "../../contexts/contexts";
import {ITestRecord} from "../interfaces";
import {readJsonFile} from "../../utils/io";
// @ts-ignore
import credentialsContext from 'credentials-context';
import {SolidDidActorV2} from "../../components/solid-actor/SolidDidActorV2";
import fetch from "cross-fetch";

/**
 * Build context map
 * @param actors
 * @returns {Map<any, any>}
 */
export function getContextMap() {
    const ctx = new Map();

    // VC
    ctx.set(credentialsContext.CONTEXT_URL_V1, credentialsContext.contexts.get(credentialsContext.CONTEXT_URL_V1))
    // BBS context
    ctx.set('https://w3id.org/security/bbs/v1', readJsonFile('src/contexts/vc-di-bbs-v1.json'))

    ctx.set('https://w3id.org/security/suites/jws-2020/v1', readJsonFile('src/contexts/suiteContext.json'))
    return ctx
}

describe('CompoundActor: SolidDidActorV2', (): void => {
    const SELECTED_TEST_ACTOR = 'alice'

    let record: ITestRecord = cssTestConfigRecords.find(r => r.testConfig.name === SELECTED_TEST_ACTOR)!

    let documentLoader: IDocumentLoader

    beforeAll(async (): Promise<void> => {

        documentLoader = createCustomDocumentLoader(getContextMap())
        // Register users & pods, and get each actor's controls object
        const controls = await register(record.userConfig)
        expect(controls).toBeTruthy()
        record.controls = controls
        // Obtain client credentials
        record.clientCredentials = await obtainClientCredentials(
            record.userConfig,
            record.controls!
        )
    });

    afterAll(async (): Promise<void> => {

    });

    async function createInitializedCompoundActor(r: ITestRecord): Promise<SolidDidActorV2> {
        const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!);

        const compoundActor = new SolidDidActorV2(
            proxy,r.userConfig.webId, documentLoader
        )

        await compoundActor.initialize()
        return compoundActor
    }

    let sda: SolidDidActorV2
    it('SolidDidActorV2 is correctly initialized', async () => {
        sda = await createInitializedCompoundActor(record)
        expect(sda.isInitialized()).toBeTruthy()
        expect(sda.solidActor.isInitialized()).toBeTruthy()
        expect(sda.didActor.isInitialized()).toBeTruthy()
    })

    it('SolidDidActorV2 correctly publishes the controller\'s DID Document', async () => {
        const response = await fetch(sda.didActor.controller)
        const {status, statusText, headers} = response
        // Check whether we actually can fetch something
        expect(status).toBe(200)
        // Check whether it's JSON-LD
        expect(headers.get('content-type')).toBe('application/ld+json')
        const controllerDoc = await response.json()
        // Check whether it's actually the DID Actor's Controller DID Document
        expect(controllerDoc).toStrictEqual(sda.didActor.controllerDocument)
    })
    
});

