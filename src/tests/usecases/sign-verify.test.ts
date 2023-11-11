import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {App} from '@solid/community-server';
import {cssTestConfigRecords, ICssTestConfig} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";

import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../../interfaces";
import {CssProxy} from "../../components/anonymizer/CssProxy";
import {createCustomDocumentLoader, ctx} from "../../contexts/contexts";
import {SolidVCActor} from "../../components/solid-actor/SolidVCActor";

export interface ITestRecord {
    testConfig: ICssTestConfig;
    userConfig: CssUserConfig;
    app?: App;
    controls?: CssControlsApiResponse;
    clientCredentials?: ClientCredentials,
    actor?: SolidVCActor
}

describe('Use case: Sign-Verify (implemented with SolidVCActors)', (): void => {

    let records: Array<ITestRecord> = cssTestConfigRecords

    async function createInitializedSolidVCActor(r: ITestRecord): Promise<SolidVCActor> {
        const documentLoader = createCustomDocumentLoader(ctx)
        const actor = new SolidVCActor(
            new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            , r.userConfig.webId, documentLoader)
        await actor.initialize()
        return actor;
    }

    beforeAll(async (): Promise<void> => {

        // Create & start each actor's app (server)
        for await (const r of records) {
            // Register users & pods, and get each actor's controls object
            const controls = await register(r.userConfig)
            expect(controls).toBeTruthy()
            r.controls = controls
            // Obtain client credentials
            r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
            // Attach initialized SolidVCActor
            r.actor = await createInitializedSolidVCActor(r)

        }
    });

    afterAll(async (): Promise<void> => {

    });

    it(`[recruiter] verifies VC created by [alice]`, async () => {
        const alice = records.find(r => r.testConfig.name === 'alice')!.actor!
        const recruiter = records.find(r => r.testConfig.name === 'recruiter')!.actor!
        const c = alice.createCredential({id: 'urn:test:vc'})
        const vc = await alice.signCredential(c)
        const verificationResult = await recruiter.verifyCredential(vc)
        expect(verificationResult.valid)
    })

});

