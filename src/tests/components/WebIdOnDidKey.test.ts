import {describe, expect, it} from '@jest/globals';
import {cssTestConfigRecords} from "../config/actorsOnCssTestConfigs";
import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {ITestRecord} from "../interfaces";
// @ts-ignore
import credentialsContext from 'credentials-context';
import {WebIdOnDidKeyActorFactory} from "../../factory/ActorFactory";
import {defaultDocumentLoaderCacheOptions} from "../config/contextmap";
import {WebIdOnDidKeyActor} from "../../components/WebIdOnDidKeyActor";

describe('WebIdOnDidKeyActor', (): void => {


    let alice: ITestRecord = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')!
    let pseudo: ITestRecord = cssTestConfigRecords.find(r => r.testConfig.name === 'pseudo')!

    const actorFactory = new WebIdOnDidKeyActorFactory(defaultDocumentLoaderCacheOptions)
    let actor: WebIdOnDidKeyActor
    async function createInitializedActor(): Promise<WebIdOnDidKeyActor> {
        return await actorFactory.createInitializedActor(alice,pseudo)
    }

    it('Can initialize', async () => {
        actor = await createInitializedActor()
        // expect(actor.isInitialized()===true)
    })

    it('Can create & sign with public actor (WebId actor), and verify with both', async () => {
        actor.enablePublicActor()
        // Create
        const c = actor.createCredential({'id': 'urn:test'});

        // Sign
        const vc: VCDIVerifiableCredential = await actor.signCredential(c)

        expect(vc.proof).toBeDefined()
        expect(vc.proof.verificationMethod).toBeDefined()
        // Make sure that the VC was issued by the public identity (WebID)
        expect(vc.issuer).toStrictEqual(actor.publicActor.identifier)
        // Make sure that the proof was created using the public identity's key
        expect(vc.proof.verificationMethod).toStrictEqual(actor.publicActor.key.id)


        // Verify (w. WebID actor)
        actor.enablePublicActor()
        const vr0 = await actor.verifyCredential(vc)
        if(vr0.verified !== true)
            console.error(vr0)

        // Verify (w. DID Key actor)
        actor.enablePseudonymousActor()
        const vr1 = await actor.verifyCredential(vc)
        if(vr1.verified !== true)
            console.error(vr1)

        expect(vr0).toHaveProperty('verified', true)
        expect(vr1).toHaveProperty('verified', true)

    })

    it('Can create & sign with pseudonymous actor (DID Key actor), and verify with both', async () => {
        actor.enablePseudonymousActor()
        // Create
        const c = actor.createCredential({'id': 'urn:test'});

        // Sign
        const vc: VCDIVerifiableCredential = await actor.signCredential(c)

        expect(vc.proof).toBeDefined()
        expect(vc.proof.verificationMethod).toBeDefined()
        // Make sure that the VC was signed using the pseudonymous identity (DID Key)
        expect(vc.issuer).toStrictEqual(actor.pseudonymousActor.identifier)
        // Make sure that the proof was created using the pseudonymous identity's key
        expect(vc.proof.verificationMethod).toStrictEqual(actor.pseudonymousActor.key.id)

        // Verify (w. WebID actor)
        actor.enablePublicActor()
        const vr0 = await actor.verifyCredential(vc)
        if(vr0.verified !== true)
            console.error(vr0)

        // Verify (w. DID Key actor)
        actor.enablePseudonymousActor()
        const vr1 = await actor.verifyCredential(vc)
        if(vr1.verified !== true)
            console.error(vr1)

        expect(vr0).toHaveProperty('verified', true)
        expect(vr1).toHaveProperty('verified', true)
    })

    it('Can create & sign a VP using the public actor, and verify with both', async() => {
        actor.enablePublicActor()
        const vc = await actor.signCredential(
            actor.createCredential({
                'id': 'urn:test',
                'ex:solid:webid': alice.userConfig.webId,
            })
        )
        // Create VP from VC
        const p = actor.createPresentation([vc], actor.activeActor.identifier)
        // Sign VP
        const challenge = 'ch4ll3ng3'
        const vp = await actor.signPresentation(p, challenge)

        expect(vp.proof).toBeDefined()
        expect(vp.proof.verificationMethod).toBeDefined()
        // Make sure that the proof was created using the public identity's key
        expect(vp.proof.verificationMethod).toStrictEqual(actor.publicActor.key.id)
        expect(vp).toHaveProperty('holder', actor.publicActor.webId)
        // Verify (w. WebID actor)
        actor.enablePublicActor()
        const vr0 = await actor.verifyPresentation(vp, challenge)
        if(vr0.verified !== true)
            console.error(vr0)

        // Verify (w. DID Key actor)
        actor.enablePseudonymousActor()
        const vr1 = await actor.verifyPresentation(vp, challenge)
        if(vr1.verified !== true)
            console.error(vr1)

        expect(vr0).toHaveProperty('verified', true)
        expect(vr1).toHaveProperty('verified', true)
    })

    it('Can create & sign a VP using the pseudonymous actor, and verify with both', async() => {
        actor.enablePseudonymousActor()
        const vc = await actor.signCredential(
            actor.createCredential({
                'id': 'urn:test',
                'ex:solid:webid': alice.userConfig.webId,
            })
        )
        // Create VP from VC
        const p = actor.createPresentation([vc],actor.activeActor.identifier)
        // Sign VP
        const challenge = 'ch4ll3ng3'
        const vp = await actor.signPresentation(p, challenge,)

        expect(vp).toHaveProperty('holder', actor.pseudonymousActor.identifier)

        expect(vp.proof).toBeDefined()
        expect(vp.proof.verificationMethod).toBeDefined()
        // Make sure that the proof was created using the pseudonymous identity's key
        expect(vp.proof.verificationMethod).toStrictEqual(actor.pseudonymousActor.key.id)

        // Verify (w. WebID actor)
        actor.enablePublicActor()
        const vr0 = await actor.verifyPresentation(vp, challenge)
        if(vr0.verified !== true)
            console.error(vr0)

        // Verify (w. DID Key actor)
        actor.enablePseudonymousActor()
        const vr1 = await actor.verifyPresentation(vp, challenge)
        if(vr1.verified !== true)
            console.error(vr1)

        expect(vr0).toHaveProperty('verified', true)
        expect(vr1).toHaveProperty('verified', true)
    })

    it('Can derive a VC using the pseudonymous actor', async () => {
        actor.enablePseudonymousActor()
        const c = actor.createCredential(
            {id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:firstName': 'Alice',
                'ex:familyName': "Doe",
                'ex:webid': actor.publicActor.webId
            })
        const frame = {
            "@context": actor.pseudonymousActor.credentialContext,
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

    it('Can create and sign a VP with a derived VC using the pseudonymous actor, and verify with both', async () => {
        actor.enablePseudonymousActor()
        const c = actor.createCredential(
            {id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:firstName': 'Alice',
                'ex:familyName': "Doe",
                'ex:webid': actor.publicActor.webId
            })
        const frame = {
            "@context": actor.pseudonymousActor.credentialContext,
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

        // Create VP with derived credential
        const constituentCredentials = [dvc]
        const p = actor.createPresentation(constituentCredentials, actor.pseudonymousActor.identifier)
        const challenge = 'ch4ll3ng3'
        const vp = await actor.signPresentation(p, challenge)

        // Verify (w. WebID actor)
        actor.enablePublicActor()
        const vr0 = await actor.verifyPresentation(vp, challenge)
        if(vr0.verified !== true)
            console.error(vr0)

        // Verify (w. DID Key actor)
        actor.enablePseudonymousActor()
        const vr1 = await actor.verifyPresentation(vp, challenge)
        if(vr1.verified !== true)
            console.error(vr1)

        expect(vr0).toHaveProperty('verified', true)
        expect(vr1).toHaveProperty('verified', true)

    })
});

