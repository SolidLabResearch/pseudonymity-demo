import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {setThing} from "@inrupt/solid-client";
import {exportPublicG2} from "../../utils/keypair";
import {AbstractBls12381G2VCActor} from "./AbstractBls12381G2VCActor";
import {Vocab, vocabs} from "../../utils/namespace";
import {NamedNode} from "n3";
import {IDidDocument, ISolidActor, ISolidProxy, IVerificationMethod} from "../interfaces";
import {IDocumentLoader} from "../../interfaces";

export class SolidVCActor
    extends AbstractBls12381G2VCActor
    implements ISolidActor {
    webId: string;
    keyName: string
    proxy: ISolidProxy

    constructor(key: Bls12381G2KeyPair, keyName: string, documentLoader: IDocumentLoader, proxy: ISolidProxy) {
        super(key, documentLoader);
        this.webId = proxy.webId;
        this.proxy = proxy;
        this.keyName = keyName
    }

    get identifier(): string {
        return this.webId;
    }

    get controllerId(): string {
        return this.webId
    }

    createControllerDocument(key: Bls12381G2KeyPair): IDidDocument {
        return {
            '@context': this.controllerDocumentContext,
            'id': this.controllerId,
            alsoKnownAs: this.webId,
            verificationMethod: [exportPublicG2(this.key!)],
            assertionMethod: [this.key.id!]
        }
    }

    async addControllerDocumentToWebIdProfileDocument() {
        let card = await this.proxy.getCard()
        const keyIri = this.webId.replace('#me', '#key')

        const secv0 = Vocab('https://w3id.org/security#')
        const secv2 = vocabs.sec
        const sec = secv0 // TODO: CLEAN UP
        const [vm] = this.controllerDocument.verificationMethod as IVerificationMethod[]
        const vmThing = this.proxy.getThingBuilder('key')
            .addIri(sec('controller'), this.webId)
            // TODO;: REMINDER: vocabs.sec uses security/v2 namespace! Keep this in mind when verification fails
            .addIri(vocabs.rdf('type'), sec('Bls12381G2Key2020'))
            .addStringNoLocale(sec('publicKeyBase58'), vm.publicKeyBase58!)
            .build()

        // Update card with vm thing
        card = setThing(card, vmThing)
        await this.proxy.updateCard(card)

        // Add verificationMethod & assertionMethod
        const pb = await this.proxy.getProfileBuilder()

        const profileUpdateThing = pb
            .addNamedNode(sec('verificationMethod'),{value: keyIri} as NamedNode)
            .addNamedNode(sec('assertionMethod'),{value: keyIri} as NamedNode)
            .build()

        card = await this.proxy.getCard()
        card = setThing(card, profileUpdateThing)

        await this.proxy.updateCard(card)
    }


    async initialize(): Promise<void> {
        await this.proxy.initialize()
        await this.addControllerDocumentToWebIdProfileDocument()
    }

    // isInitialized(): boolean {
    //     return [
    //         super.isInitialized(),
    //         this.proxy.isInitialized()
    //     ].every(x => x)
    // }
}
