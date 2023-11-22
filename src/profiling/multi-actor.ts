import {ICredentialActor, VerificationResult} from "../components/solid-actor/interfaces";
import {customVocab} from "../contexts/customVocab";
import {VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import assert from "node:assert";
import {SolidVCActorFactory} from "../tests/ActorFactory";
import {ActorTestConfiguration, cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../utils/css";
import {ITestRecord} from "../tests/interfaces";
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
namespace UsecaseProfiling {
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

    let p01: VerifiablePresentation
    let vp01: VerifiablePresentation
    let vr01: VerificationResult

    let p02: VerifiablePresentation
    let vp02: VerifiablePresentation
    let vr02: VerificationResult

    export async function initializeActors() {
        const actorFactory = new SolidVCActorFactory()
        const actorTags = ['alice', 'university', 'government', 'recruiter']
        const actorConfigRecords = Object.fromEntries(
            actorTags.map((actorTag: string) => [
                actorTag,
                (cssTestConfigRecords as Array<ITestRecord>)
                    .find(r => r.testConfig.name === actorTag)
            ])
        )
        const registerActor = async (r: ITestRecord)=> {
            // Register users & pods, and get each actor's controls object
            r.controls = await register(r.userConfig)
            // Obtain client credentials
            r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
            return r
        }

        const initializedActors = Object.fromEntries(
            await Promise.all(
                Object.entries(actorConfigRecords).map(
                    async ([actorTag, acr]) => {
                        assert(acr!!)
                        acr = await registerActor(acr!)
                        return [actorTag,await actorFactory.createInitializedActor(acr!)]
                    }
                )
            )
        ) as {[p: string]: ICredentialActor}

        holder = initializedActors['alice']
        university = initializedActors['university']
        government = initializedActors['government']
        recruiter = initializedActors['recruiter']

    }

    export async function phase1(){
        const challenge = 'ch4ll3ng3'

        // Government creates identity credential
        cIdentity = government.createCredential(credentialResources.identity.unsigned.credentialSubject)
        cIdentity['@context'] = credentialResources.identity.unsigned['@context']
        vcIdentity = await government.signCredential(cIdentity)

        // University creates diploma credential
        cDiploma = university.createCredential(credentialResources.diploma.unsigned.credentialSubject)
        cDiploma['@context'] = credentialResources.diploma.unsigned['@context']
        vcDiploma = await university.signCredential(cDiploma)

        /** Recruiter sends holder the required attributes for the diploma verification phase **/

        // Holder derives diploma credential
        dvcDiploma = await holder.deriveCredential(vcDiploma, credentialResources.diploma.derivationFrame)

        // Holder creates VP01 with derived diploma credential
        p01 = holder.createPresentation([dvcDiploma], holder.identifier)
        vp01 = await holder.signPresentation(p01,challenge)

        // Recruiter verifies VP01
        vr01 = await recruiter.verifyPresentation(vp01, challenge)
        // Sanity check: VP01verificationResult is valid
        assert(vr01.verified === true)
        console.log(vr01)

        /** Recruiter sends holder the required attributes for the identity verification phase **/
        /** Holder sends VP01 to recruiter **/

        // Holder derives identity credential
        dvcIdentity = await holder.deriveCredential(vcIdentity, credentialResources.identity.derivationFrame)

        // Holder creates VP02 with derived identity credential
        p02 = holder.createPresentation([dvcIdentity], holder.identifier)
        vp02 = await holder.signPresentation(p02, challenge)

        // Recruiter verifies VP02
        vr02 = await recruiter.verifyPresentation(vp02, challenge)
        // Sanity check: VP02verificationResult is valid
        assert(vr02.verified === true)

    }
}
UsecaseProfiling.initializeActors()
    .then(UsecaseProfiling.phase1)
