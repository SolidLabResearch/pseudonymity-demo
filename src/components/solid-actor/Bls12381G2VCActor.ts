import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {KeyPairActor} from "./KeyPairActor";
import {IDocumentLoader} from "../../contexts/interfaces";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";
import {AbstractVCActor} from "./AbstractVCActor";
import {CredentialSubject} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {JsonLdDocument} from "jsonld";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {ICredentialActor, VerifiableCredential, VerificationResult} from "./interfaces";




export class Bls12381G2VCActor
    extends AbstractVCActor<BbsBlsSignature2020, BbsBlsSignature2020, BbsBlsSignatureProof2020>
    implements ICredentialActor, KeyPairActor<Bls12381G2KeyPair> {
    signSuite?: BbsBlsSignature2020 | undefined;
    verifySuite?: BbsBlsSignature2020 | undefined;
    deriveSuite?: BbsBlsSignatureProof2020 | undefined;
    key: Bls12381G2KeyPair;
    keyName: string

    constructor(key: Bls12381G2KeyPair, documentLoader: IDocumentLoader) {
        super(documentLoader);
        this.key = key;
        this.keyName = key.fingerprint()
    }

    get identifier(): string {
        return this.key.controller!
    }

    get controllerId(): string {
        return `did:key:${this.key.fingerprint()}`
    }

    initializeSuites(): void {
        this.signSuite = new BbsBlsSignature2020({key: this.key})
        this.signSuite = _hack_addEnsureContextFunction(this.signSuite)
        this.verifySuite = new BbsBlsSignature2020()
        this.deriveSuite = new BbsBlsSignatureProof2020()
    }
}
