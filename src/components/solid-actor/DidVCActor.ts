import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {KeyPairActor} from "./KeyPairActor";
import {IDocumentLoader} from "../../contexts/interfaces";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";
import {GenericVCActor} from "./GenericVCActor";
import {ICredentialActor} from "./interfaces";
import {IDidDocument} from "./did-interfaces";
import {toDidKeyDocument} from "../../utils/keypair";


export abstract class AbstractBls12381G2VCActor
    extends GenericVCActor<BbsBlsSignature2020, BbsBlsSignature2020, BbsBlsSignatureProof2020>
    implements ICredentialActor, KeyPairActor<Bls12381G2KeyPair> {
    signSuite?: BbsBlsSignature2020 | undefined;
    verifySuite?: BbsBlsSignature2020 | undefined;
    deriveSuite?: BbsBlsSignatureProof2020 | undefined;
    key: Bls12381G2KeyPair;


    constructor(key: Bls12381G2KeyPair, documentLoader: IDocumentLoader) {
        super(documentLoader);
        this.key = key;

    }

    abstract get identifier(): string

    abstract get controllerDocument(): IDidDocument

    get controllerDocumentContext(): string[] {
        return ['https://www.w3.org/ns/did/v1']
    }
    get controllerId(): string {
        return this.identifier
    }

    initializeSuites(): void {
        this.signSuite = new BbsBlsSignature2020({key: this.key})
        this.signSuite = _hack_addEnsureContextFunction(this.signSuite)
        this.verifySuite = new BbsBlsSignature2020()
        this.deriveSuite = new BbsBlsSignatureProof2020()
    }
}

export class DidVCActor extends AbstractBls12381G2VCActor {
    get identifier(): string {
        return `did:key:${this.key!.fingerprint()}`
    }

    get controllerDocument(): IDidDocument {
        return toDidKeyDocument(this.key!)
    }

}

