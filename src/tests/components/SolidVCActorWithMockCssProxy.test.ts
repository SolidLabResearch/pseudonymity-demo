import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {cssTestConfigRecords} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";
import {CssProxy} from "../../components/solid-actor/CssProxy";
import {createCustomDocumentLoader} from "../../contexts/contexts";
import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {ITestRecord} from "../interfaces";
// @ts-ignore
import credentialsContext from 'credentials-context';
import {getContextMap} from "../config/contextmap";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {SolidVCActor} from "../../components/solid-actor/SolidVCActor";
import {klona} from "klona";
import {MockCssProxy} from "../mock/MockCssProxy";
import {fetch} from 'cross-fetch'
import {isValidUrl} from "../../utils/url";
import {exportPublicG2} from "../../utils/keypair";
import {namespaces} from "../../utils/namespace";
import {IDocumentLoader} from "../../interfaces";
describe('SolidVCActor', (): void => {
    const SELECTED_TEST_ACTOR = 'alice'

    let records: Array<ITestRecord> = cssTestConfigRecords.filter(r => r.testConfig.name === SELECTED_TEST_ACTOR)

    let documentLoader: IDocumentLoader
    let actor: SolidVCActor

    beforeAll(async (): Promise<void> => {

    });

    afterAll(async (): Promise<void> => {
        await (actor.proxy as MockCssProxy).close()
    });

    async function createInitializedActor(r: ITestRecord): Promise<SolidVCActor> {
        const { webId } = r.userConfig;
        // Determine URL for DIDs container, based on the pod url
        const didsContainer = webId.replace('#me','')
        const controllerId = webId

        // Generate BLS12381 G2 Key using a seed
        const seed = Uint8Array.from(Buffer.from('testseed'))
        const keyName = "key"
        const keyId = `${didsContainer}#${keyName}`;
        const key = await Bls12381G2KeyPair.generate({
            id: keyId,
            seed,
            controller: controllerId
        })

        const defaultContextMap = getContextMap()
        documentLoader = createCustomDocumentLoader(defaultContextMap)
        const controllerDoc = {
            '@context': namespaces.did,
            'id': controllerId,
            alsoKnownAs: webId,
            verificationMethod: [exportPublicG2(key)],
            assertionMethod: [key.id]
        }
        const proxy = new MockCssProxy(webId, controllerDoc)
        const a = new SolidVCActor(key, keyName, documentLoader, proxy)
        await a.initialize()
        return a
    }


    for (let i = 0; i < records.length; i++) {
        const r = records[i]


        it(`[${r.testConfig.name}] should be able to initialize a SolidVCActorV2`, async () => {
            actor = await createInitializedActor(r)
            // Sanity check
            expect(actor.key).toBeDefined()
        })

        it(`[${r.testConfig.name}] can create, sign, and verify a VC`, async () => {

            // Create
            const c = actor.createCredential({'id': 'urn:test'});


            // Sign
            const vc: VCDIVerifiableCredential = await actor.signCredential(c)

            expect(vc.proof).toBeDefined()
            expect(vc.proof.verificationMethod).toBeDefined()


            /**
             * DEBUG NOTE: With respect to: GenericVCActor.credentialContext
             *
             * When using the following credential context:
             *      'https://www.w3.org/2018/credentials/v1',
             *      "https://w3id.org/security/bbs/v1",
             *
             * The proof object will contain the property 'verificationMethod'.
             *
             * However, when using the following credential context:
             *      'https://www.w3.org/ns/credentials/v2'
             * The verificationMethod property must be accessed through its absolute URI,
             * i.e. 'https://w3id.org/security#verificationMethod'
             *
             */
            // expect(vc.proof.hasOwnProperty('https://w3id.org/security#verificationMethod')).toBeTruthy()

            // expect(vc.proof['https://w3id.org/security#verificationMethod'])
            //     .toHaveProperty('id',actor.key!.id)

            // Verify
            const verificationResult = await actor.verifyCredential(vc)
            /**
             * DEBUG NOTE: With respect to: GenericVCActor.credentialContext
             * VerificationResult.verified == FALSE for option01
             */
            if(verificationResult.verified !== true)
                console.error(verificationResult)
            expect(verificationResult).toHaveProperty('verified', true)
        })

        it(`[${r.testConfig.name}] can create, sign, and verify a VP`, async () => {

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

