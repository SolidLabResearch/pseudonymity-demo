import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {cssTestConfigRecords} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";
import {CssProxy} from "../../components/solid-actor/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {createCustomDocumentLoader} from "../../contexts/contexts";
import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {ITestRecord} from "../interfaces";
// @ts-ignore
import credentialsContext from 'credentials-context';
import {getContextMap} from "../config/contextmap";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {SolidVCActor} from "../../components/solid-actor/SolidVCActor";
import n3 from 'n3'

describe('SolidVCActor', (): void => {
    const SELECTED_TEST_ACTOR = 'alice'

    let records: Array<ITestRecord> = cssTestConfigRecords.filter(r => r.testConfig.name === SELECTED_TEST_ACTOR)

    let documentLoader: IDocumentLoader

    beforeAll(async (): Promise<void> => {

        documentLoader = createCustomDocumentLoader(getContextMap())

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
        const { webId } = r.userConfig;
        const proxy = new CssProxy(r.clientCredentials!, webId, r.controls!)
        // Determine URL for DIDs container, based on the pod url
        const didsContainer = webId.replace('#me','')
        const controllerId = didsContainer

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
        return a
    }


    for (let i = 0; i < records.length; i++) {
        const r = records[i]

        let actor: SolidVCActor
        it(`[${r.testConfig.name}] should be able to initialize a SolidVCActorV2`, async () => {
            actor = await createInitializedActor(r)
            expect(actor.isInitialized())
            // Sanity check
            expect(actor.key).toBeDefined()
        })

        it(`[${r.testConfig.name}] SolidVCActor should add controller semantics to WebID Document`, async () => {
            // const actor = await createInitializedActor(r) // TODO: delete
            expect(actor.isInitialized())
            // Controller Doc Checks

            // The controller doc is available as a json-ld representation
            const {status, statusText, headers} = await fetch(actor.key.controller!, {headers: {accept: 'application/ld+json'}})
            expect(status).toBe(200)
            expect(headers.get('content-type')).toContain('application/ld+json')

            // SolidVCActor has updated the WebID Profile Document to contain verificationMethod & assertionMethod
            const urlControllerDoc = actor.controllerId
            const store = new n3.Store()
            new n3.Parser({format: 'application/n-quads'})
                .parse(
                    await (
                        await fetch(urlControllerDoc, {headers: {accept: 'application/n-quads'}})
                    ).text()
                )
                .forEach(q=>store.addQuad(q))



            const vmQuads = store.getQuads(
                actor.webId,
                'https://w3id.org/security#verificationMethod',
                actor.key!.id!,
                null
            )

            const controllerQuads = store.getQuads(
                actor.key!.id!,
                'https://w3id.org/security#controller',
                actor.controllerId,
                null
            )

            const assertionMethodQuads = store.getQuads(
                actor.webId,
                'https://w3id.org/security#assertionMethod',
                actor.key!.id!,
                null
            )

            expect(vmQuads).toHaveLength(1)
            expect(controllerQuads).toHaveLength(1)
            expect(assertionMethodQuads).toHaveLength(1)
        })

        it(`[${r.testConfig.name}] can create, sign, and verify a VC`, async () => {
            // const actor = await createInitializedActor(r) // TODO: delete
            // Create
            const c = actor.createCredential({'id': 'urn:test'});

            // Sign
            const vc: VCDIVerifiableCredential = await actor.signCredential(c)

            expect(vc.proof).toBeDefined()
            expect(vc.proof.verificationMethod).toBeDefined()

            // Verify
            const verificationResult = await actor.verifyCredential(vc)
            if(verificationResult.verified !== true)
                console.error(verificationResult)
            expect(verificationResult).toHaveProperty('verified', true)
        })

        it(`[${r.testConfig.name}] can create, sign, and verify a VP`, async () => {
            // const actor = await createInitializedActor(r) // TODO: delete
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
            if(verificationResult.verified !== true)
                console.error(verificationResult)
            expect(verificationResult).toHaveProperty('verified', true)
        })

        it(`[${r.testConfig.name}] can derive a VC`, async () => {
            // const actor = await createInitializedActor(r) // TODO: delete
            const c = actor.createCredential(
                {id: 'urn:test:id000',
                    'ex:identifier': '123456789ab',
                    'ex:familyName': "Doe",
                    'ex:webid': "https://gov.be/john.doe"
                })
            const frame = {
                "@context": actor.credentialContext,
                "type": ["VerifiableCredential"],
                "credentialSubject": {
                    "@explicit": true,
                    'ex:webid': {}
                }
            }
            // Create VC
            const vc = await actor.signCredential(c)
            // Derive VC
            const dvc = await actor.deriveCredential(vc, frame)
            // Claim attributes that should be defined
            expect(dvc.credentialSubject['ex:webid']).toBeDefined()
            // Claim attributes that should NOT be defined
            expect(dvc.credentialSubject['ex:identifier']).not.toBeDefined()
            expect(dvc.credentialSubject['ex:familyName']).not.toBeDefined()
        })

    }

});

