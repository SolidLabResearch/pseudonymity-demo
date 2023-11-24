import {ICredentialActor, VerificationResult} from "../components/solid-actor/interfaces";
import {customVocab} from "../contexts/customVocab";
import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import assert from "node:assert";
import {IActorFactory} from "../tests/ActorFactory";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {ITestRecord} from "../tests/interfaces";

import {IActorStep, IActorStepRecord, IMultiActorReport} from "./interfaces";
import {trackActorStep} from "./track";
import path from "path";
import {dirProfilingReports} from "./config";
import {writeFileSync} from "fs";
import {writeJsonFile} from "../utils/io";


const credentialResources = {
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
                'givenName': 'John',
                'familyName': "Doe",
                'solid:webid': "https://gov.be/john.doe"
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
                customVocab.url,
            ],
            id: 'urn:vc:02',
            type: ['VerifiableCredential', 'UniversityDegreeCredential'],
            issuer: undefined,
            issuanceDate: '2021-06-19T18:53:11Z',
            credentialSubject: {
                id: 'urn:test:id000',
                'identifier': '123456789ab',
                degree: 'Msc. Physics',
                grade: '789/1000'
            }
        },
        derivationFrame: {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://w3id.org/security/bbs/v1",
                "https://w3id.org/citizenship/v1",
                customVocab.url,
            ],
            type: ['VerifiableCredential', 'UniversityDegreeCredential'],
            "credentialSubject": {
                "@explicit": true,
                // 'identifier': {},
                degree: {}
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


export async function initializeActors(actorFactory: IActorFactory<any>) {

    const actorTags = ['alice', 'university', 'government', 'recruiter']
    const actorConfigRecords = Object.fromEntries(
        actorTags.map((actorTag: string) => [
            actorTag,
            (cssTestConfigRecords as Array<ITestRecord>)
                .find(r => r.testConfig.name === actorTag)
        ])
    )

    const initializedActors = Object.fromEntries(
        await Promise.all(
            Object.entries(actorConfigRecords).map(
                async ([actorTag, acr]) => {
                    assert(acr!!)
                    // acr = await registerActor(acr!)
                    let actor: ICredentialActor = await actorFactory.createInitializedActor(acr!)
                    actor.tag = actorTag
                    actor.className = (actor as any).constructor.name
                    return [actorTag, actor]
                }
            )
        )
    ) as {[p: string]: ICredentialActor}

    holder = initializedActors['alice']
    university = initializedActors['university']
    government = initializedActors['government']
    recruiter = initializedActors['recruiter']
}
export namespace ActorSteps {
    export async function createDiplomaCredential(actor: ICredentialActor)  {
        cDiploma = actor.createCredential(credentialResources.diploma.unsigned.credentialSubject)
        cDiploma['@context'] = credentialResources.diploma.unsigned['@context']
    }
    export async function signDiplomaCredential(actor: ICredentialActor) {
        vcDiploma = await actor.signCredential(cDiploma)
    }

    export async function createIdentityCredential(actor: ICredentialActor) {
        cIdentity = actor.createCredential(credentialResources.identity.unsigned.credentialSubject)
        cIdentity['@context'] = credentialResources.identity.unsigned['@context']
    }

    export async function signIdentityCredential(actor: ICredentialActor) {
        vcIdentity = await actor.signCredential(cIdentity)
    }

    export async function deriveDiplomaCredential(actor: ICredentialActor) {
        dvcDiploma = await actor.deriveCredential(vcIdentity, credentialResources.diploma.derivationFrame)
    }

    export async function createPresentation01(actor: ICredentialActor) {
        p01 = actor.createPresentation([dvcDiploma], actor.identifier)
    }

    export async function signPresentation01(actor: ICredentialActor){
        vp01 = await actor.signPresentation(p01,challenge)
    }

    export async function verifyPresentation01(actor: ICredentialActor) {
        vr01 = await actor.verifyPresentation(vp01, challenge)
        assert(vr01.verified === true) // Sanity check
    }

    export async function deriveIdentityCredential(actor: ICredentialActor) {
        dvcIdentity = await actor.deriveCredential(vcIdentity, credentialResources.identity.derivationFrame)
    }

    export async function createPresentation02(actor: ICredentialActor){
        p02 = actor.createPresentation([dvcIdentity], actor.identifier)
    }

    export async function signPresentation02(actor: ICredentialActor){
        vp02 = await actor.signPresentation(p02, challenge)
    }

    export async function verifyPresentation02(actor: ICredentialActor){
        vr02 = await actor.verifyPresentation(vp02, challenge)
        assert(vr02.verified === true) // Sanity check
    }

}

export namespace MultiActorEvaluator {
    export const createActorSteps = () : IActorStep[] => {
        return [
            {actor: university, f: ActorSteps.createDiplomaCredential},
            {actor: university, f: ActorSteps.signDiplomaCredential},
            {actor: government, f: ActorSteps.createIdentityCredential},
            {actor: government, f: ActorSteps.signIdentityCredential},

            {actor: holder, f: ActorSteps.deriveDiplomaCredential},
            {actor: holder, f: ActorSteps.createPresentation01},
            {actor: holder, f: ActorSteps.signPresentation01},

            {actor: recruiter, f: ActorSteps.verifyPresentation01},

            {actor: holder, f: ActorSteps.deriveIdentityCredential},
            {actor: holder, f: ActorSteps.createPresentation02},
            {actor: holder, f: ActorSteps.signPresentation02},

            {actor: recruiter, f: ActorSteps.verifyPresentation02},
        ]
    }
    export async function evaluate(actorSteps: Array<IActorStep>): Promise<IMultiActorReport> {
        const startEvaluation = Date.now()
        const stepRecords  = new Array<IActorStepRecord>()
        let stepIndex = 0;
        for await (const s of actorSteps) {
            const actorStepRecord = await trackActorStep(s)
            stepRecords.push({  index: stepIndex, ...actorStepRecord,})
            stepIndex++;
        }
        const endEvaluation = Date.now()
        return {
            start: startEvaluation,
            end: endEvaluation,
            delta: endEvaluation - startEvaluation,
            records: stepRecords

        } as IMultiActorReport
    }
}

export async function runMultiActorEvaluation(actorFactory: IActorFactory<ICredentialActor>) {
    await initializeActors(actorFactory)
        .then(MultiActorEvaluator.createActorSteps)
        .then(MultiActorEvaluator.evaluate)
        .then((multiActorReport: IMultiActorReport) => {

            // multiActorReport.records[0].
            console.log(multiActorReport)
            const filenameReport = [
                'multiactor-report',
                multiActorReport.start
            ].join('-') + '.json'
            const fpathReport =path.join(dirProfilingReports, filenameReport)
            writeFileSync(fpathReport, JSON.stringify(multiActorReport))

            // We can also export the documentloader cache options (as they will greatly influence the results)
            const fpathDocumentLoaderCacheOptions = path.join(
                dirProfilingReports, `${multiActorReport.start}documentLoaderCacheOptions.json`
            )
            writeJsonFile(fpathDocumentLoaderCacheOptions, actorFactory.documentLoaderCacheOptions)

            }
        )

}

