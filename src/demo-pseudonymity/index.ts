import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import assert from "node:assert";
import {IActorFactory} from "../factory/ActorFactory";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {ITestRecord} from "../tests/interfaces";

import {IActorStep, IActorStepRecord, IMultiActorReport, IUseCaseActorsSetup} from "../profiling/interfaces";
import {trackActorStep} from "../profiling/track";
import path from "path";
import fs from "fs";
import {CompoundCredentialActor} from "../components/CompoundCredentialActor";
import {getHostReport} from "../utils/profiling";
import {ICredentialActor} from "../interfaces/did";
import {VerifiableCredential, VerificationResult} from "../interfaces/credentials";
import {initializeUseCaseActorsForDidKeySolution} from "../profiling/did-key-pseudonymizer";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";

export const credentialResources = {
    'identity': {
        unsigned: {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                "https://w3id.org/security/bbs/v1",
                "https://w3id.org/citizenship/v1",
            ],
            id: 'urn:vc:01',
            type: ['VerifiableCredential'],
            issuer: undefined,
            issuanceDate: '2021-06-19T18:53:11Z',
            credentialSubject: {
                id: 'urn:test:id000',
                "type": ["PermanentResident", "Person"],
                'identifier': '123456789ab',
                'givenName': 'Alice',
                'familyName': "Doe",
                'solid:webid': "http://localhost:3000/alice/profile/card#me"
            }
        },
        derivationFrame: {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://w3id.org/security/bbs/v1",
                "https://w3id.org/citizenship/v1",
            ],
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                "type": ["PermanentResident", "Person"],
                // 'identifier': {},
                'solid:webid': {}
            }
        }
    },
    'diploma': {
        unsigned: {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                "https://w3id.org/security/bbs/v1",
                "https://w3id.org/citizenship/v1",
                // customVocab.url,
            ],
            id: 'urn:vc:02',
            type: ['VerifiableCredential',
                // 'UniversityDegreeCredential'
            ],
            issuer: undefined,
            issuanceDate: '2021-06-19T18:53:11Z',
            credentialSubject: {
                id: 'urn:test:id000',
                'identifier': '123456789ab',
                'ex:degreeTitle': 'Msc. Physics',
                'ex:grade': '789/1000'
            }
        },
        derivationFrame: {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://w3id.org/security/bbs/v1",
                "https://w3id.org/citizenship/v1",
                // customVocab.url,
            ],
            type: ['VerifiableCredential',
                // 'UniversityDegreeCredential'
            ],
            "credentialSubject": {
                "@explicit": true,
                // 'identifier': {},
                'ex:degreeTitle': {}
            }
        }
    }
}

// Issuers
let university: ICredentialActor
let government: ICredentialActor
// Holder
let holder: ICredentialActor
// Verifier
let recruiter: ICredentialActor

// Credentials
let cIdentity: VCDIVerifiableCredential
let vcIdentity: VCDIVerifiableCredential
let dvcIdentity: VCDIVerifiableCredential

let cDiploma: VCDIVerifiableCredential
let vcDiploma: VCDIVerifiableCredential
let dvcDiploma: VCDIVerifiableCredential

const challenge = 'ch4ll3ng3'

let p01: VerifiablePresentation
let vp01: VerifiablePresentation
let vr01: VerificationResult

let p02: VerifiablePresentation
let vp02: VerifiablePresentation
let vr02: VerificationResult


export namespace ActorSteps {
    export async function createDiplomaCredential(actor: ICredentialActor)  {
        cDiploma = actor.createCredential(credentialResources.diploma.unsigned.credentialSubject)
        cDiploma['@context'] = credentialResources.diploma.unsigned['@context']
        return cDiploma
    }
    export async function signDiplomaCredential(actor: ICredentialActor) {
        vcDiploma = await actor.signCredential(cDiploma)
        return vcDiploma
    }

    export async function createIdentityCredential(actor: ICredentialActor) {
        cIdentity = actor.createCredential(credentialResources.identity.unsigned.credentialSubject)
        cIdentity['@context'] = credentialResources.identity.unsigned['@context']
        return cIdentity
    }

    export async function createIdentityLinkingCredentials(actor: CompoundCredentialActor<any, any>) {
        // T(rue) acknowledges P(seudo): The true-identity actor creates a VC
        // stating that the identity link between T is bound to P
        actor.enablePublicActor();
        let vcTackP = await actor.signCredential(
            actor.createCredential({
                'ex:pseudoId': actor.pseudonymousIdentifier,
                'ex:trueId': actor.publicIdentifier
            })
        )
        // P(seudo) acknowledges T(rue): The pseudo-identity actor creates a VC
        // stating the identity link between P is bound to T
        actor.enablePseudonymousActor()
        let vcPackT = await actor.signCredential(
            actor.createCredential({
                'ex:pseudoId': actor.pseudonymousIdentifier,
                'ex:trueId': actor.publicIdentifier
            })
        )
        return [ vcTackP, vcPackT ]
    }

    export async function signIdentityCredential(actor: ICredentialActor) {
        vcIdentity = await actor.signCredential(cIdentity)
        return vcIdentity
    }

    export async function deriveDiplomaCredential(actor: ICredentialActor) {
        dvcDiploma = await actor.deriveCredential(vcDiploma, credentialResources.diploma.derivationFrame)
        return dvcDiploma
    }

    export async function createPresentation01(actor: ICredentialActor) {
        p01 = actor.createPresentation([dvcDiploma], actor.identifier)
        return p01
    }

    export async function signPresentation01(actor: ICredentialActor){
        vp01 = await actor.signPresentation(p01,challenge)
        return vp01
    }

    export async function verifyPresentation01(actor: ICredentialActor) {
        vr01 = await actor.verifyPresentation(vp01, challenge)
        assert(vr01.verified === true) // Sanity check
        return vr01
    }

    export async function deriveIdentityCredential(actor: ICredentialActor) {
        dvcIdentity = await actor.deriveCredential(vcIdentity, credentialResources.identity.derivationFrame)
        return dvcIdentity
    }

    export async function createPresentation02(actor: ICredentialActor){
        // Create Identity Linking Credentials
        const idLinkingVCs = await createIdentityLinkingCredentials(actor as CompoundCredentialActor<any, any>)
        // Add Identity Linking Credentials to VP
        p02 = actor.createPresentation([
            dvcIdentity,
            ...idLinkingVCs
        ], actor.identifier)
        return p02
    }

    export async function signPresentation02(actor: ICredentialActor){
        vp02 = await actor.signPresentation(p02, challenge)
        return vp02
    }

    export async function verifyPresentation02(actor: ICredentialActor){
        vr02 = await actor.verifyPresentation(vp02, challenge)
        assert(vr02.verified === true) // Sanity check
        return vr02
    }

}

export namespace MultiActorEvaluator {

    export const createActorSteps = (actors: IUseCaseActorsSetup) : IActorStep[] => {
        const {
            alice: holder, university,
            recruiter,
            government
        } = actors;
        return [
            {actor: university, f: ActorSteps.createDiplomaCredential},
            {actor: university, f: ActorSteps.signDiplomaCredential},
            {actor: government, f: ActorSteps.createIdentityCredential},
            {actor: government, f: ActorSteps.signIdentityCredential},

            {actor: holder, mode: 'pseudo', f: ActorSteps.deriveDiplomaCredential},
            {actor: holder, mode: 'pseudo', f: ActorSteps.createPresentation01},
            {actor: holder, mode: 'pseudo', f: ActorSteps.signPresentation01},

            {actor: recruiter, f: ActorSteps.verifyPresentation01},

            {actor: holder, mode: 'public', f: ActorSteps.deriveIdentityCredential},
            {actor: holder, mode: 'public', f: ActorSteps.createPresentation02},
            {actor: holder, mode: 'public', f: ActorSteps.signPresentation02},

            {actor: recruiter, f: ActorSteps.verifyPresentation02},
        ]
    }
    export async function evaluate(actorSteps: Array<IActorStep>): Promise<IMultiActorReport> {
        const startEvaluation = Date.now()
        const stepRecords  = new Array<IActorStepRecord>()
        let stepIndex = 0;
        for await (const s of actorSteps) {

            if(s.mode!! && s.actor instanceof CompoundCredentialActor)
                (s.actor as CompoundCredentialActor<any, any>).setActorMode(s.mode!)

            const actorStepRecord = await trackActorStep(s)
            console.log(actorStepRecord)
            stepRecords.push({  index: stepIndex, ...actorStepRecord,})
            stepIndex++;
        }
        const endEvaluation = Date.now()
        return {
            start: startEvaluation,
            end: endEvaluation,
            delta: endEvaluation - startEvaluation,
            records: stepRecords,

        } as IMultiActorReport
    }
}

/**
 * Execute pseudonymity demo with given use case actors.
 * @param usecaseActors
 */
export async function runDemo(usecaseActors: IUseCaseActorsSetup) {
    const actorSteps = MultiActorEvaluator.createActorSteps(usecaseActors)
    const hostReport = getHostReport()
    // Execute
    const multiActorReport = await MultiActorEvaluator.evaluate(
        actorSteps
    )

    return {
        ...multiActorReport,
        documentLoaderCacheOptions: usecaseActors.documentLoaderCacheOptions,
        hostReport
    }
}
async function main() {
    console.log('Running pseudonymity demo')
    const documentLoaderCachingOptions: DocumentLoaderCacheOptions = {
        HTTP: { cacheWebResourcesResolvedFromLocalHostInstances: false, cacheWebResourcesResolvedFromTheWeb: false},
        DID: { cacheResolvedDIDDocs: false }
    }
    const actorsSetup = await initializeUseCaseActorsForDidKeySolution(documentLoaderCachingOptions)
    console.log(actorsSetup)
    const demoOutput = await runDemo(actorsSetup)
    const outputDir = path.resolve(__dirname, '..', '..')
    const outputFilepath = path.resolve(outputDir, 'pseudonymity-demo-output.json')
    console.log(`Writing demo output to ${outputFilepath}`)
    fs.writeFileSync(outputFilepath, JSON.stringify(demoOutput, null, 2))
}
main().then().catch(console.error)
