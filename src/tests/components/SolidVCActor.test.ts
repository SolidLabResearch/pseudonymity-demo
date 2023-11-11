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
import {ITestRecord} from "../interfaces";

describe('SolidVCActor', (): void => {
    const SELECTED_TEST_ACTOR = 'alice'

    let records: Array<ITestRecord> = cssTestConfigRecords.filter(r => r.testConfig.name === SELECTED_TEST_ACTOR)

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

    async function createInitializedActor(r: ITestRecord): Promise<SolidVCActor> {
        const a = new SolidVCActor(
            new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!),
            r.userConfig.webId,
            documentLoader
        )
        await a.initialize()
        return a
    }


    for (let i = 0; i < records.length; i++) {
        const r = records[i]

        it(`[${r.testConfig.name}] should be able to initialize a SolidVCActor`, async () => {
            const actor = await createInitializedActor(r)
            expect(actor.isInitialized())
            // Sanity check
            expect(actor.g2).toBeDefined()
        })

        it(`[${r.testConfig.name}] can create, sign, and verify a VC`, async () => {
            const actor = await createInitializedActor(r)
            // Create
            const c = actor.createCredential({'id': 'urn:test'});

            // Sign
            const vc: VCDIVerifiableCredential = await actor.signCredential(c)
            expect(vc.proof).toBeDefined()
            // vc.proof 's verificationMethod must point to the actor's g2 key id
            expect(vc.proof.verificationMethod).toEqual(actor.g2!.id)

            // Verify
            const verificationResult = await actor.verifyCredential(vc)
            expect(verificationResult.valid)
        })

        it(`[${r.testConfig.name}] can create, sign, and verify a VP`, async () => {
            const actor = await createInitializedActor(r)
            // Create VC
            const vc = await actor.signCredential(
                actor.createCredential({
                    'id': 'urn:test',
                    'ex:solid:webid': r.userConfig.webId,
                })
            )
            // Create VP from VC
            const p = actor.createPresentation([vc])
            // Sign VP
            const challenge = 'ch4ll3ng3'
            const vp = await actor.signPresentation(p, challenge)
            // Verify VP
            const verificationResult = await actor.verifyPresentation(vp,challenge)
            expect(verificationResult.valid)
        })

        it.skip(`[${r.testConfig.name}] can derive a VC`, async () => {
            // TODO
        })

        it.skip(`[${r.testConfig.name}] can create, sign, and verify a VP containing derived VCs`, async () => {
            // TODO
        })


    }

});

