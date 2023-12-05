import {CompoundActor} from "./CompoundActor";
import {SolidVCActor} from "./SolidVCActor";
import {DidVCActor} from "./DidVCActor";
import {
    ICredentialActor,
    ICredentialCreator, IDeriver,
    ISigner,
    IVerifier,
    VerifiableCredential,
    VerificationResult
} from "./interfaces";
import {CredentialSubject} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {string} from "rdflib/lib/utils-js";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {frame, JsonLdDocument} from "jsonld";
export class WebIdOnWebIdActor extends CompoundActor<SolidVCActor, SolidVCActor>
implements IVerifier, ISigner, IDeriver {


    constructor(a1: SolidVCActor, a2: SolidVCActor) {
        super(a1, a2);

    }

    enablePublicActor() {
        this.activeActorIndex = 0
    }
    enablePseudonymousActor() {
        this.activeActorIndex = 1
    }
    get publicActor() {
        return this.a1
    }
    get pseudonymousActor() {
        return this.a2
    }
    get publicIdentifier() {
        return this.a1.identifier
    }
    get pseudonymousIdentifier() {
        return this.a2.identifier
    }

    createCredential(credentialSubject: CredentialSubject): VerifiableCredential {
        return this.activeActor.createCredential(credentialSubject)
    }

    createPresentation(credentials: VerifiableCredential[], holder?: string | undefined): VerifiablePresentation {
        return this.activeActor.createPresentation(credentials,holder)
    }

    signCredential(c: VerifiableCredential, purpose?: any): Promise<VerifiableCredential> {
        return this.activeActor.signCredential(c, purpose)
    }

    signPresentation(p: VerifiablePresentation, challenge: string, purpose?: any): Promise<VerifiablePresentation> {
        return this.activeActor.signPresentation(p, challenge, purpose)
    }

    verifyCredential(c: VerifiableCredential, purpose?: any): Promise<VerificationResult> {
        return this.activeActor.verifyCredential(c, purpose)
    }

    verifyPresentation(vp: VerifiablePresentation, challenge: string, purpose?: any): Promise<VerificationResult> {
        return this.activeActor.verifyPresentation(vp, challenge, purpose)
    }

    deriveCredential(vc: VerifiableCredential, frame: JsonLdDocument): Promise<VerifiableCredential> {
        return this.activeActor.deriveCredential(vc, frame)
    }

}
