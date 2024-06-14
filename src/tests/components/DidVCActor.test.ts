import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {createCustomDocumentLoader} from "../../contexts/contexts";
import {readJsonFile} from "../../utils/io";
// @ts-ignore
import credentialsContext from 'credentials-context';
import {toDidKeyDocument} from "../../utils/keypair";
import {DidKeyVCActor} from "../../components/DidKeyVCActor";
import {DidVCActorFactory} from "../../factory/ActorFactory";
import {defaultDocumentLoaderCacheOptions} from "../config/contextmap";
import {cssTestConfigRecords} from "../config/actorsOnCssTestConfigs";
import {IDocumentLoader} from "../../interfaces";

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

describe('DidVCActor extends AbstractVCActor', (): void => {
    const SELECTED_TEST_ACTOR = 'alice'

    let record = cssTestConfigRecords.find(r => r.testConfig.name === SELECTED_TEST_ACTOR)!
    let documentLoader: IDocumentLoader

    beforeAll(async (): Promise<void> => {
        documentLoader = createCustomDocumentLoader(getContextMap())
    });

    afterAll(async (): Promise<void> => {

    });


    const actorFactory = new DidVCActorFactory(defaultDocumentLoaderCacheOptions)
    async function createInitializedActor(): Promise<DidKeyVCActor> {
        return await actorFactory.createInitializedActor(record)
    }

    it('Actor (identified by its did:key identifier) can create, sign, and verify a VC', async () => {
        const actor = await createInitializedActor()
        const didKeyDocument = toDidKeyDocument(actor.key)

        const c = actor.createCredential({id: 'urn:test:did:key'})
        const vc = await actor.signCredential(c)
        expect(vc.issuer).toStrictEqual(didKeyDocument.id)

        // The proof's verification method should be listed in the DID Document's
        // verification methods of type <proofPurpose>
        // TODO: FIX -> since changing to credential/v2 context, the proof object is not mapped onto attributes. Absolute URLs should still work (e.g. https://w3id.org/security#proofPurpose)
        // expect(Object(didKeyDocument)[vc.proof.proofPurpose].includes(vc.proof.verificationMethod)).toBeTruthy()

        const verificationResult = await actor.verifyCredential(vc)
        if(verificationResult.verified !== true)
            console.error(verificationResult.error)
        expect(verificationResult).toHaveProperty('verified', true)
    })

    it('Actor (identified by its did:key identifier) creates a VP with a derived VC, and can sign & verify it', async () => {
        const actor = await createInitializedActor()
        const didKeyDocument = toDidKeyDocument(actor.key)

        // Create VC
        const c = actor.createCredential(
            {id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:familyName': "Doe",
                'ex:webid': "https://gov.be/john.doe"
        })
        const vc = await actor.signCredential(c)

        // JSON-LD Frame to articulate which attributes to select for disclosure
        const frame = {
            "@context": actor.credentialContext,
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                'ex:webid': {}
            }
        }

        // Derive VC
        const dvc = await actor.deriveCredential(vc, frame)
        expect(dvc.proof.proofType === typeof actor.deriveSuite)
        // Claim attributes that should be defined
        expect(dvc.credentialSubject['ex:webid']).toBeDefined()
        // Claim attributes that should NOT be defined
        expect(dvc.credentialSubject['ex:identifier']).not.toBeDefined()
        expect(dvc.credentialSubject['ex:familyName']).not.toBeDefined()
        // The proof's verification method should be listed in the DID Document's
        // verification methods of type <proofPurpose>
        // TODO: FIX -> since changing to credential/v2 context, the proof object is not mapped onto attributes. Absolute URLs should still work (e.g. https://w3id.org/security#proofPurpose)
        // expect(Object(didKeyDocument)[dvc.proof.proofPurpose].includes(vc.proof.verificationMethod)).toBeTruthy()

        // Create VP with derived credential
        const constituentCredentials = [dvc]
        const p = actor.createPresentation(constituentCredentials, actor.key.controller)
        const challenge = 'ch4ll3ng3'
        const vp = await actor.signPresentation(p, challenge)

        // Verify
        const verificationResult = await actor.verifyPresentation(vp, challenge)

        if(!verificationResult.verified)
            console.log(verificationResult)
        expect(verificationResult).toHaveProperty('verified', true)
    })

});

