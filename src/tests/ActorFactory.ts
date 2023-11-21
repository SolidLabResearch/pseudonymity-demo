import {ITestRecord} from "./interfaces";
import {IActor} from "../components/solid-actor/interfaces";
import {SolidVCActor} from "../components/solid-actor/SolidVCActor";
import {CssProxy} from "../components/solid-actor/CssProxy";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {createCustomDocumentLoader} from "../contexts/contexts";
import {getContextMap} from "./config/contextmap";
import {DidActor} from "../components/solid-actor/DidActor";
import {DidVCActor} from "../components/solid-actor/DidVCActor";
import {toDidKeyDocument} from "../utils/keypair";
import {IVerificationMethod} from "../components/solid-actor/did-interfaces";

export abstract class AbstractActorFactory<A> {
    documentLoader = createCustomDocumentLoader(getContextMap())


    abstract createInitializedActor(r?: ITestRecord): Promise<A>
}

export class DidActorFactory extends AbstractActorFactory<DidActor> {
    async createInitializedActor(): Promise<DidActor> {
        const controller = 'urn:test:controller'
        const keyName = "key-g2"
        const actor = new DidActor('test-seed', controller,keyName);
        await actor.initialize()
        return actor
    }

}
export class DidVCActorFactory extends AbstractActorFactory<DidVCActor> {
    async createInitializedActor(): Promise<DidVCActor> {
        // Generate BLS12381 G2 Key using a seed
        const seed = Uint8Array.from(Buffer.from('testseed'))
        let key = await Bls12381G2KeyPair.generate({ seed })
        // Create its corresponding did:key DID Document
        const didKeyDocument = toDidKeyDocument(key)
        const {id, verificationMethod} = didKeyDocument
        const vm = (verificationMethod as IVerificationMethod[])[0]
        // Re-instantiate BLS12381 G2, but with set with the did:key identifiers
        key = new Bls12381G2KeyPair({
            id: vm.id,
            controller: id,
            privateKeyBase58: key.privateKey,
            publicKeyBase58: key.publicKey
        })
        const actor = new DidVCActor(key,this.documentLoader);
        await actor.initialize()
        return actor
    }

}

export class SolidVCActorFactory extends AbstractActorFactory<SolidVCActor> {
    async createInitializedActor(r: ITestRecord): Promise<SolidVCActor> {
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


        const a = new SolidVCActor(key, keyName, this.documentLoader, proxy)

        await a.initialize()
        return a
    }

}
