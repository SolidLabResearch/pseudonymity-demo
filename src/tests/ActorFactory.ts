import {ITestRecord} from "./interfaces";
import {SolidVCActor} from "../components/solid-actor/SolidVCActor";
import {CssProxy} from "../components/solid-actor/CssProxy";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {createCustomDocumentLoader, DocumentLoaderCacheOptions} from "../contexts/contexts";
import {getContextMap} from "./config/contextmap";
import {DidActor} from "../components/solid-actor/DidActor";
import {DidVCActor} from "../components/solid-actor/DidVCActor";
import {toDidKeyDocument} from "../utils/keypair";
import {IVerificationMethod} from "../components/solid-actor/did-interfaces";
import {obtainClientCredentials, register} from "../utils/css";
import {IDocumentLoader} from "../contexts/interfaces";
import {CompoundActor} from "../components/solid-actor/CompoundActor";
import {WebIdOnDidKeyActor} from "../components/solid-actor/WebIdOnDidKeyActor";
import {WebIdOnWebIdActor} from "../components/solid-actor/WebIdOnWebIdActor";
import {ICredentialActor} from "../components/solid-actor/interfaces";
import {CompoundCredentialActor} from "../components/solid-actor/CompoundCredentialActor";

export interface IActorFactory<A> {
    documentLoader: IDocumentLoader
    documentLoaderCacheOptions: DocumentLoaderCacheOptions
    createInitializedActor(r: ITestRecord): Promise<A>
    cache: {
        [key: string]: A
    }
}


export abstract class AbstractActorFactory<A> implements IActorFactory<A> {
    cache: { [p: string]: A };
    documentLoaderCacheOptions: DocumentLoaderCacheOptions

    documentLoader: IDocumentLoader
    constructor(documentLoaderCacheOptions?: DocumentLoaderCacheOptions) {

        this.documentLoader = createCustomDocumentLoader(getContextMap(),documentLoaderCacheOptions)
        this.documentLoaderCacheOptions = documentLoaderCacheOptions!
        this.cache = {}
    }


    abstract createInitializedActor(r: ITestRecord): Promise<A>
}

export class DidActorFactory extends AbstractActorFactory<DidActor> {
    async createInitializedActor(r?: ITestRecord): Promise<DidActor> {
        const name = r! ? r!.testConfig.name : 'testactor'
        const seed = r! ? r!.testConfig.name! : 'testseed'
        const controller = `urn:${name}:controller`
        const keyName = "key-g2"
        const actor = new DidActor(seed, controller,keyName);
        await actor.initialize()
        return actor
    }

}
export class DidVCActorFactory extends AbstractActorFactory<DidVCActor> {


    constructor(documentLoaderCacheOptions: DocumentLoaderCacheOptions) {
        super(documentLoaderCacheOptions);
    }

    async createInitializedActor(r: ITestRecord): Promise<DidVCActor> {

        if(Object.keys(this.cache).includes(r.userConfig.email)) {
            console.log('returning from CACHE!')
            return this.cache[r.userConfig.email]
        }
        // Generate BLS12381 G2 Key using a seed
        const seed = Uint8Array.from(Buffer.from(r.userConfig.password))
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
        this.cache[r.userConfig.email] = actor
        console.log(`DidVCActor cache size: ${Object.keys(this.cache).length}`)
        return actor
    }

}

export class SolidVCActorFactory extends AbstractActorFactory<SolidVCActor> {


    constructor(documentLoaderCacheOptions: DocumentLoaderCacheOptions) {
        super(documentLoaderCacheOptions);
    }

    async registerActor (r: ITestRecord) {
        // Register users & pods, and get each actor's controls object
        r.controls = await register(r.userConfig)
        // Obtain client credentials
        r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
        return r
    }

    async createInitializedActor(r: ITestRecord): Promise<SolidVCActor> {
        const { webId } = r.userConfig;
        if(Object.keys(this.cache).includes(r.userConfig.webId)) {
            console.log('returning from CACHE!')
            return this.cache[webId]
        }

        r = await this.registerActor(r)

        const proxy = new CssProxy(r.clientCredentials!, webId)
        // Determine URL for DIDs container, based on the pod url
        const didsContainer = webId.replace('#me','')
        const controllerId = didsContainer

        // Generate BLS12381 G2 Key using a seed
        const seed = Uint8Array.from(Buffer.from(webId))
        const keyName = "key"
        const keyId = `${controllerId}#${keyName}`;
        const key = await Bls12381G2KeyPair.generate({
            id: keyId,
            seed,
            controller: controllerId
        })


        const a = new SolidVCActor(key, keyName, this.documentLoader, proxy)

        await a.initialize()
        this.cache[a.webId]= a

        return a
    }

}

export class AbstractCompoundCredentialActorFactory<
    A1 extends ICredentialActor,
    A2 extends ICredentialActor
>

{
    documentLoaderCacheOptions: DocumentLoaderCacheOptions
    cache: { [p: string]: CompoundCredentialActor<A1, A2> };
    f1: IActorFactory<A1>
    f2: IActorFactory<A2>

    constructor(f1: IActorFactory<A1>, f2: IActorFactory<A2>, documentLoaderCacheOptions: DocumentLoaderCacheOptions) {
        this.documentLoaderCacheOptions = documentLoaderCacheOptions
        this.cache = {}
        this.f1 = f1;
        this.f2 = f2;
    }

    async createInitializedActor(r1: ITestRecord, r2: ITestRecord): Promise<CompoundCredentialActor<A1, A2>> {
        const { webId } = r1.userConfig;
        if(Object.keys(this.cache).includes(webId)) {
            console.log('returning from CACHE!')
            return this.cache[webId]
        }
        const a1 = await this.f1.createInitializedActor(r1)
        const a2 = await this.f2.createInitializedActor(r2)
        const cca = new CompoundCredentialActor<A1,A2>(a1, a2)
        this.cache[webId] = cca
        return cca
    }

}
export class WebIdOnDidKeyActorFactory extends AbstractCompoundCredentialActorFactory<SolidVCActor, DidVCActor>{
    constructor(documentLoaderCacheOptions: DocumentLoaderCacheOptions) {
        super(
            new SolidVCActorFactory(documentLoaderCacheOptions),
            new DidVCActorFactory(documentLoaderCacheOptions),
            documentLoaderCacheOptions
        );
    }
    async createInitializedActor(r1: ITestRecord, r2: ITestRecord): Promise<WebIdOnDidKeyActor> {
        return (await super.createInitializedActor(r1, r2)) as WebIdOnDidKeyActor
    }
}



export class WebIdOnWebIdActorFactory
    extends AbstractCompoundCredentialActorFactory<SolidVCActor,DidVCActor> {
    constructor(documentLoaderCacheOptions: DocumentLoaderCacheOptions) {
        super(
            new SolidVCActorFactory(documentLoaderCacheOptions),
            new SolidVCActorFactory(documentLoaderCacheOptions),
            documentLoaderCacheOptions
        );
    }
    async createInitializedActor(r1: ITestRecord, r2: ITestRecord): Promise<WebIdOnWebIdActor> {
        return (await super.createInitializedActor(r1, r2)) as WebIdOnWebIdActor
    }
}
export class WebIdOnWebIdActorFactoryOld {
    sf1: SolidVCActorFactory
    sf2: SolidVCActorFactory

    constructor(documentLoaderCacheOptions: DocumentLoaderCacheOptions) {
        this.sf1 = new SolidVCActorFactory(documentLoaderCacheOptions)
        this.sf2 = new SolidVCActorFactory(documentLoaderCacheOptions)

    }


    async createInitializedActor(rs1: ITestRecord, rs2: ITestRecord): Promise<WebIdOnWebIdActor> {
        const s1 = await this.sf1.createInitializedActor(rs1)
        const s2 = await this.sf2.createInitializedActor(rs2)
        return new WebIdOnWebIdActor(s1,s2)
    }

}
