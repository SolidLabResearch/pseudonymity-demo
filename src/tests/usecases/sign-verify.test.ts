import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {App} from '@solid/community-server';
import {cssTestConfigRecords, ICssTestConfig} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";

import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../../interfaces";
import {CssProxy} from "../../components/anonymizer/CssProxy";
import {createCustomDocumentLoader, ctx} from "../../contexts/contexts";
import {SolidVCActor} from "../../components/solid-actor/SolidVCActor";
import {ITestRecord} from "../interfaces";



describe('Use case: Sign-Verify (implemented with SolidVCActors)', (): void => {

    let records: Array<ITestRecord> = cssTestConfigRecords
    let alice: SolidVCActor
    let recruiter: SolidVCActor

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

        alice = records.find(r => r.testConfig.name === 'alice')!.actor!
        recruiter = records.find(r => r.testConfig.name === 'recruiter')!.actor!

    });

    afterAll(async (): Promise<void> => {

    });

    it(`[recruiter] verifies VC created by [alice]`, async () => {
        const c = alice.createCredential({id: 'urn:test:vc'})
        const vc = await alice.signCredential(c)
        const verificationResult = await recruiter.verifyCredential(vc)
        expect(verificationResult.valid)
    })

    it(`[recruiter] verifies VP created by [alice]`, async () => {
        // [alice] creates a VC, and uses it to create a VP
        const c = alice.createCredential({id: 'urn:test:vc'})
        const vc = await alice.signCredential(c)
        const p = alice.createPresentation([vc], alice.webId)
        const challenge = 'ch4ll3ng3'
        const vp = await alice.signPresentation(p,challenge)
        // [recruiter] verifies the VP from [alice]
        const verificationResult = await recruiter.verifyPresentation(vp, challenge)
        expect(verificationResult).toHaveProperty('verified', true)
    })

    // TODO
    it(`[recruiter] verifies derived VC created by [alice]`, async () => {

        const c = alice.createCredential(
            {id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:familyName': "Doe",
                'ex:webid': "https://gov.be/john.doe"
            })
        const frame = {
            "@context": alice.credentialContext,
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                'ex:webid': {}
            }
        }
        // Create VC
        const vc = await alice.signCredential(c)
        // Derive VC
        const dvc = await alice.deriveCredential(vc, frame)
        // Claim attributes that should be defined
        expect(dvc.credentialSubject['ex:webid']).toBeDefined()
        // Claim attributes that should NOT be defined
        expect(dvc.credentialSubject['ex:identifier']).not.toBeDefined()
        expect(dvc.credentialSubject['ex:familyName']).not.toBeDefined()

        // Create VP
        const p = alice.createPresentation([dvc], alice.webId)
        const challenge = 'ch4ll3ng3'
        const vp = await alice.signPresentation(p,challenge)
        // [recruiter] verifies the VP from [alice]
        const verificationResult = await recruiter.verifyPresentation(vp, challenge)

        if(verificationResult.verified !== true)
            console.error(verificationResult)

        expect(verificationResult).not.toHaveProperty('error')
        expect(verificationResult).toHaveProperty('verified', true)

    })

});

