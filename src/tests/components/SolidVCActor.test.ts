import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {App} from '@solid/community-server';
import {cssTestConfigRecords, ICssTestConfig} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";

import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../../interfaces";
import {CssProxy} from "../../components/anonymizer/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {createCustomDocumentLoader, ctx} from "../../contexts/contexts";
import {SolidVCActor} from "../../components/solid-actor/SolidVCActor";
import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";

describe('SolidVCActor', (): void => {
    const SELECTED_TEST_ACTOR = 'alice'

    let records: Array<{
        testConfig: ICssTestConfig
        userConfig: CssUserConfig
        app?: App // Placeholder for when we want to spin up the CSS servers as part of the test suite.
        controls?: CssControlsApiResponse
        clientCredentials?: ClientCredentials
    }> = cssTestConfigRecords.filter(r => r.testConfig.name === SELECTED_TEST_ACTOR)

    let documentLoader: IDocumentLoader

    beforeAll(async (): Promise<void> => {

        documentLoader = createCustomDocumentLoader(ctx)

        // Create & start each actor's app (server)
        for await (const r of records) {
            // Register users & pods, and get each actor's controls object
            const controls = await register(r.userConfig)
            expect(controls).toBeTruthy()
            r.controls = controls
            // Obtain client credentials
            r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
        }
    });

    afterAll(async (): Promise<void> => {

    });


    for (let i = 0; i < records.length; i++) {
        const r = records[i]

        it(`[${r.testConfig.name}] Should initialize a SolidVCActor`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            const solidVCActor = new SolidVCActor(proxy, r.userConfig.webId, documentLoader)
            await solidVCActor.initialize()
            expect(solidVCActor.isInitialized())
            // Sanity check
            expect(solidVCActor.g2).toBeDefined()
        })

        it(`[${r.testConfig.name}] Can create, sign, and verify a VC`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            const solidVCActor = new SolidVCActor(proxy, r.userConfig.webId, documentLoader)
            await solidVCActor.initialize()
            expect(solidVCActor.isInitialized())

            // Create
            const c = solidVCActor.createCredential({'id': 'urn:test'});

            // Sign
            const vc: VCDIVerifiableCredential = await solidVCActor.signCredential(c)
            expect(vc.proof).toBeDefined()
            // vc.proof 's verificationMethod must point to the actor's g2 key id
            expect(vc.proof.verificationMethod).toEqual(solidVCActor.g2!.id)

            // Verify
            const verificationResult = await solidVCActor.verifyCredential(vc)
            expect(verificationResult.valid)
        })

        it.skip(`[${r.testConfig.name}] Can create, sign, and verify a VP`, async () => {
            // TODO
        })

        it.skip(`[${r.testConfig.name}] Can derive a VC`, async () => {
            // TODO
        })

        it.skip(`[${r.testConfig.name}] Can create, sign, and verify a VP containing derived VCs`, async () => {
            // TODO
        })


    }

});

