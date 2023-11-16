import {IActor, ICredentialActor, VerifiableCredential, VerificationResult} from "../components/solid-actor/interfaces";
import fs, {writeFileSync} from 'fs'
// @ts-ignore
import credentialsContext from 'credentials-context';
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {createInitializedActor as createDidKeyActor} from "./did-key";
import {createInitializedActor as createWebResolvingActor} from "./web-resolvable"
import path from "path";
import {dirProfilingReports} from "./config";

function readJsonFile(path:string) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function getContextMap() {
    const ctx = new Map();
    // VC
    ctx.set(credentialsContext.CONTEXT_URL_V1, credentialsContext.contexts.get(credentialsContext.CONTEXT_URL_V1))
    // BBS context
    ctx.set('https://w3id.org/security/bbs/v1', readJsonFile('src/contexts/vc-di-bbs-v1.json'))

    ctx.set('https://w3id.org/security/suites/jws-2020/v1', readJsonFile('src/contexts/suiteContext.json'))
    return ctx
}


export interface ITimeTrackRecord {
    start: number
    end: number
    delta: number
}
export interface IStepRecord extends ITimeTrackRecord {
    name: string
    index?: number
}

export interface IActorReport extends ITimeTrackRecord {
    actor: ICredentialActor
    records: IStepRecord[]
}
async function trackStep(f: () => Promise<void>) {
    const {name} = f
    const start = Date.now()
    await f()
    const end = Date.now()
    const delta = end - start
    return { name, start, end, delta } as IStepRecord
}

async function evaluate(actor: ICredentialActor) {
    const startEvaluation = Date.now()
    let c: VerifiableCredential
    let vc: VerifiableCredential
    let frame: object
    let dvc: VerifiableCredential
    const challenge = 'ch4ll3ng3'
    let p: VerifiablePresentation
    let vp: VerifiablePresentation
    let verificationResult: VerificationResult

    async function createCredential()  {
        // Create VC
        c = actor.createCredential(
            {id: 'urn:test:id000',
                'ex:identifier': '123456789ab',
                'ex:familyName': "Doe",
                'ex:webid': "https://gov.be/john.doe"
            })
    }

    async function createVerifiableCredential() {
        vc = await actor.signCredential(c)
    }

    /**
     * JSON-LD Frame to articulate which attributes to select for disclosure
     */
    async function createJSONLDFrame() {
        frame = {
            "@context": actor.credentialContext,
            "type": ["VerifiableCredential"],
            "credentialSubject": {
                "@explicit": true,
                'ex:webid': {}
            }
        }
    }

    async function deriveCredential() {
        dvc = await actor.deriveCredential(vc, frame)
    }

    async function createPresentationWithDerivedVC() {
        // Create VP with derived credential
        const constituentCredentials = [dvc]
        p = actor.createPresentation(constituentCredentials, actor.identifier)

    }
    async function signPresentation() {
        vp = await actor.signPresentation(p, challenge)
    }

    async function verifyPresentation() {
        // Verify
        verificationResult = await actor.verifyPresentation(vp, challenge)

        if(!verificationResult.verified) {
            throw new Error(`VC or VP is NOT valid!
            ${JSON.stringify(verificationResult)}`)
        }
    }

    // Define steps to execute
    const steps = [
        createCredential,
        createVerifiableCredential,
        createJSONLDFrame,
        deriveCredential,
        createPresentationWithDerivedVC,
        signPresentation,
        verifyPresentation
    ]

    // Execute & track steps
    const stepRecords: Array<IStepRecord> = new Array<IStepRecord>()
    let stepIndex = 0;
    for await (const wrappedFunc of steps) {
        stepRecords.push({index: stepIndex, ...await trackStep(wrappedFunc)})
        stepIndex++;
    }
    const endEvaluation = Date.now()

    // Return actor report
    return {
        actor: actor,
        records: stepRecords,
        start: startEvaluation,
        end: endEvaluation,
        delta: endEvaluation - startEvaluation
    } as IActorReport
}

export async function runEvaluation(actor: ICredentialActor) {
    const actorReport = await evaluate(actor)
    console.log(JSON.stringify(actorReport))
    const filenameReport = [
        (actorReport.actor as any).constructor.name,
        actorReport.start
    ].join('-') + '.json'
    const fpathReport =path.join(dirProfilingReports, filenameReport)
    writeFileSync(fpathReport, JSON.stringify(actorReport))
}
