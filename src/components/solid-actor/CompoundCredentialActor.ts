import {ICredentialActor, VerifiableCredential, VerificationResult} from "./interfaces";
import {CompoundActor} from "./CompoundActor";
import {CredentialSubject} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {JsonLdDocument} from "jsonld";
import {ICompoundCredentialActor} from "../../profiling/interfaces";

export class CompoundCredentialActor<A1 extends ICredentialActor, A2 extends ICredentialActor>
    extends CompoundActor<A1, A2>
    implements ICompoundCredentialActor {

    constructor(publicActor: A1, pseudonymousActor: A2) {
        super(publicActor, pseudonymousActor);
    }

    enablePseudonymousActor(): void {
        this.activeActorIndex = 1
    }

    enablePublicActor(): void {
        this.activeActorIndex = 0
    }

    get publicActor() {
        return this.a1
    }

    get pseudonymousActor() {
        return this.a2
    }

    get identifier() {
        return this.activeActor.identifier
    }

    get credentialContext(): string | string[] {
        return this.activeActor.credentialContext
    }

    get publicIdentifier() {
        return this.a1.identifier
    }

    get pseudonymousIdentifier() {
        return this.a2.identifier
    }

    setActorMode(mode: 'pseudo' | 'public') {
        switch (mode) {
            case 'public':
                this.enablePublicActor()
                break;
            case 'pseudo':
                this.enablePseudonymousActor()
                break;
            default:
                throw new Error(`Unknown mode: ${mode}`)
        }

    }

    createCredential(credentialSubject: CredentialSubject): VerifiableCredential {
        return this.activeActor.createCredential(credentialSubject)
    }

    createPresentation(credentials: VerifiableCredential[], holder?: string | undefined): VerifiablePresentation {
        return this.activeActor.createPresentation(credentials, holder)
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
