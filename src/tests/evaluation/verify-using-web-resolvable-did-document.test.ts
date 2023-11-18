import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {cssTestConfigRecords} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";
import {CssProxy} from "../../components/solid-actor/CssProxy";
import {createCustomDocumentLoader} from "../../contexts/contexts";
import {ITestRecord} from "../interfaces";
import path from "path";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {getContextMap} from "../config/contextmap";
import {SolidVCActor} from "../../components/solid-actor/SolidVCActor";


describe('Evaluation - Phase 1 - Using Web Resolvable DID Document', (): void => {

    let records: Array<ITestRecord> = cssTestConfigRecords
    let alice: SolidVCActor
    let recruiter: SolidVCActor
    let government: SolidVCActor
    let university: SolidVCActor


    async function createInitializedActor(r: ITestRecord): Promise<SolidVCActor> {
        const { webId } = r.userConfig;
        const proxy = new CssProxy(r.clientCredentials!, webId, r.controls!)
        // Determine URL for DIDs container, based on the pod url
        const didsContainer = path.join(proxy.podUrl!, 'dids') + '/';
        const controllerId = path.join(didsContainer, 'controller')
        // Generate BLS12381 G2 Key using a seed
        const seed = Uint8Array.from(Buffer.from('testseed'))
        const keyName = "key"
        const keyId = `${controllerId}#${keyName}`;
        const key = await Bls12381G2KeyPair.generate({
            id: keyId,
            seed,
            controller: controllerId
        })

        const documentLoader = createCustomDocumentLoader(getContextMap())

        const a = new SolidVCActor(key, keyName, documentLoader, proxy)
        await a.initialize()
        return a
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
            r.actor = await createInitializedActor(r)
        }

        alice = records.find(r => r.testConfig.name === 'alice')!.actor! as SolidVCActor
        recruiter = records.find(r => r.testConfig.name === 'recruiter')!.actor! as SolidVCActor
        government = records.find(r => r.testConfig.name === 'government')!.actor! as SolidVCActor
        university = records.find(r => r.testConfig.name === 'university')!.actor! as SolidVCActor

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
        const vp = await alice.signPresentation(p, challenge)
        // [recruiter] verifies the VP from [alice]
        const verificationResult = await recruiter.verifyPresentation(vp, challenge)
        expect(verificationResult).toHaveProperty('verified', true)
    })

    it(`[recruiter] verifies VP with 1 derived VC created by [alice]`, async () => {
        const c = alice.createCredential(
            {
                id: 'urn:test:id000',
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
        const constituentCredentials = [dvc]
        const p = alice.createPresentation(constituentCredentials, alice.webId)
        const challenge = 'ch4ll3ng3'
        const vp = await alice.signPresentation(p, challenge)
        // [recruiter] verifies the VP from [alice]
        const verificationResult = await recruiter.verifyPresentation(vp, challenge)

        if (verificationResult.verified !== true)
            console.error(verificationResult)

        expect(verificationResult).not.toHaveProperty('error')
        expect(verificationResult).toHaveProperty('verified', true)

        expect(verificationResult.results).toHaveLength(constituentCredentials.length)
        for (const result of verificationResult.results) {
            expect(result).toHaveProperty('verified', true);
        }
    })

    it(`[recruiter] verifies VP with 2 derived VC created by [alice]`, async () => {
        // VC01
        const c = alice.createCredential(
            {
                id: 'urn:test:id000',
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

        // VC02
        const c2 = alice.createCredential(
            {
                id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:degreeTitle': "Msc. Physics",
                'ex:university': "Ghent University"
            })
        const frame2 = {
            "@context": alice.credentialContext,
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                'ex:degreeTitle': {}
            }
        }

        // Create VC02
        const vc2 = await alice.signCredential(c2)
        // Derive VC
        const dvc2 = await alice.deriveCredential(vc2, frame2)
        expect(dvc2.credentialSubject['ex:degreeTitle']).toBeDefined()
        // Claim attributes that should NOT be defined
        expect(dvc2.credentialSubject['ex:identifier']).not.toBeDefined()
        expect(dvc2.credentialSubject['ex:university']).not.toBeDefined()

        // Create VP
        const constituentCredentials = [dvc, dvc2]
        const p = alice.createPresentation(constituentCredentials, alice.webId)
        const challenge = 'ch4ll3ng3'
        const vp = await alice.signPresentation(p, challenge)
        expect(vp.verifiableCredential).toHaveLength(constituentCredentials.length)
        // [recruiter] verifies the VP from [alice]
        const verificationResult = await recruiter.verifyPresentation(vp, challenge)

        if (verificationResult.verified !== true)
            console.error(verificationResult)

        expect(verificationResult).not.toHaveProperty('error')
        expect(verificationResult).toHaveProperty('verified', true)
    })

    it(`[government] issues VC01 to [alice] ; [alice] creates VP with derived VC01 ; [recruiter] verifies VP`, async () => {
        const c = government.createCredential(
            {
                id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:familyName': "Doe",
                'ex:webid': "https://gov.be/john.doe"
            })
        const frame = {
            "@context": government.credentialContext,
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                'ex:webid': {}
            }
        }
        // Create VC
        const vc01 = await government.signCredential(c)
        // Derive VC
        const dvc = await alice.deriveCredential(vc01, frame)
        // Claim attributes that should be defined
        expect(dvc.credentialSubject['ex:webid']).toBeDefined()
        // Claim attributes that should NOT be defined
        expect(dvc.credentialSubject['ex:identifier']).not.toBeDefined()
        expect(dvc.credentialSubject['ex:familyName']).not.toBeDefined()

        // Create VP
        const constituentCredentials = [dvc]
        const p = alice.createPresentation(constituentCredentials, alice.webId)
        const challenge = 'ch4ll3ng3'
        const vp = await alice.signPresentation(p, challenge)
        // [recruiter] verifies the VP from [alice]
        const verificationResult = await recruiter.verifyPresentation(vp, challenge)

        if (verificationResult.verified !== true)
            console.error(verificationResult)

        expect(verificationResult).not.toHaveProperty('error')
        expect(verificationResult).toHaveProperty('verified', true)

        expect(verificationResult.results).toHaveLength(constituentCredentials.length)
        for (const result of verificationResult.results) {
            expect(result).toHaveProperty('verified', true);
        }
    })

    it(`[government] issues VC01 to [alice] ;
    [university] issues VC02 to [alice] ; 
    [alice] creates VP with derived VC01 & derived VC02 ; 
    [recruiter] verifies VP`, async () => {
        // VC01
        const c = government.createCredential(
            {
                id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:familyName': "Doe",
                'ex:webid': "https://gov.be/john.doe"
            })
        const frame = {
            "@context": government.credentialContext,
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                'ex:webid': {}
            }
        }
        // Create VC
        const vc01 = await government.signCredential(c)
        // Derive VC
        const dvc = await alice.deriveCredential(vc01, frame)
        // Claim attributes that should be defined
        expect(dvc.credentialSubject['ex:webid']).toBeDefined()
        // Claim attributes that should NOT be defined
        expect(dvc.credentialSubject['ex:identifier']).not.toBeDefined()
        expect(dvc.credentialSubject['ex:familyName']).not.toBeDefined()


        // VC02
        const c2 = university.createCredential(
            {
                id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:degreeTitle': "Msc. Physics",
                'ex:university': "Ghent University"
            })
        const frame2 = {
            "@context": alice.credentialContext,
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                'ex:degreeTitle': {}
            }
        }
        // Create VC
        const vc02 = await university.signCredential(c2)
        // Derive VC
        const dvc02 = await alice.deriveCredential(vc02, frame2)
        expect(dvc02.credentialSubject['ex:degreeTitle']).toBeDefined()
        // Claim attributes that should NOT be defined
        expect(dvc02.credentialSubject['ex:identifier']).not.toBeDefined()
        expect(dvc02.credentialSubject['ex:university']).not.toBeDefined()
        // Create VP
        const constituentCredentials = [dvc, dvc02]
        const p = alice.createPresentation(constituentCredentials, alice.webId)
        const challenge = 'ch4ll3ng3'
        const vp = await alice.signPresentation(p, challenge)

        // [recruiter] verifies the VP from [alice]
        const verificationResult = await recruiter.verifyPresentation(vp, challenge)
        if (verificationResult.verified !== true)
            console.error(JSON.stringify(verificationResult,null,2))

        expect(verificationResult).not.toHaveProperty('error')
        expect(verificationResult).toHaveProperty('verified', true)

        for (const result of verificationResult.results) {
            expect(result).toHaveProperty('verified', true);
        }
    })

});

