import {customVocab} from "../contexts/customVocab";
import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import assert from "node:assert";
import {IActorFactory} from "../tests/ActorFactory";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {ITestRecord} from "../tests/interfaces";

import {IActorStep, IActorStepRecord, IMultiActorReport, IUseCaseActorsSetup} from "./interfaces";
import {trackActorStep} from "./track";
import path from "path";
import {writeFileSync} from "fs";
import {mkdirp} from "fs-extra";
import {WebIdOnWebIdActor} from "../components/WebIdOnWebIdActor";
import {CompoundCredentialActor} from "../components/CompoundCredentialActor";
import {writeJsonFile} from "../utils/io";
import {defaultDocumentLoaderCacheOptions} from "../tests/config/contextmap";
import {getHostReport} from "../utils/profiling";
import {ICredentialActor} from "../interfaces/did";
import {VerificationResult} from "../interfaces/credentials";

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
        p02 = actor.createPresentation([dvcIdentity], actor.identifier)
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
    export const createActorSteps = () : IActorStep[] => {
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
    export const createActorStepsV2 = (actors: IUseCaseActorsSetup) : IActorStep[] => {
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
 * Run multi actor evaluation on provided actor factories.
 * Export results to given parent dir.
 * /parentDir
 *      documentLoaderCacheOptions.json
 *      actorFactory-X/
 *          multiactor-report-1.json
 *          multiactor-report-2.json
 *          ...
 *      actorFactory-Y/
 *         multiactor-report-1.json
 *         multiactor-report-2.json
 *         ...
 * @param actorFactories
 * @param parentDir
 */
export async function runMultiActorEvaluation(actorFactories: IActorFactory<ICredentialActor>[], parentDir: string) {


    for await (const actorFactory of actorFactories) {
        console.log(`Profiling (${(actorFactory as any).constructor.name})`)
        await initializeActors(actorFactory)
        .then(MultiActorEvaluator.createActorSteps)
        .then(MultiActorEvaluator.evaluate)
        .then(async (multiActorReport: IMultiActorReport) => {
            const filenameReport = [
                'multiactor-report',
                multiActorReport.start
            ].join('-') + '.json'

            await mkdirp(parentDir)
            const fpathReport =path.join(parentDir, filenameReport)
            const multiActorReportUpdate = {
                ...multiActorReport,
                documentLoaderCacheOptions: actorFactory.documentLoaderCacheOptions
            }
            writeFileSync(fpathReport, JSON.stringify(multiActorReportUpdate, null, 2))

        })
    }

}

/**
 * TODO: cleanup, improve.
 * @param usecaseActors
 * @param parentDir
 */
export async function runMultiActorEvaluationV2(usecaseActors: IUseCaseActorsSetup, parentDir: string) {


    const actorSteps = MultiActorEvaluator.createActorStepsV2(usecaseActors)
    const hostReport = getHostReport()
    const multiActorReport = await MultiActorEvaluator.evaluate(
        actorSteps
    )

    const filenameReport = [
        'multiactor-report',
        multiActorReport.start
    ].join('-') + '.json'

    await mkdirp(parentDir)

    const fpathReport =path.join(parentDir, filenameReport)
    const multiActorReportUpdate = {
        ...multiActorReport,
        // Note: assuming all actors have same dlco as alice. Needs improvement? Yes. Time? No.
        documentLoaderCacheOptions: usecaseActors.documentLoaderCacheOptions,
        hostReport

    }
    writeFileSync(fpathReport, JSON.stringify(multiActorReportUpdate))
}

