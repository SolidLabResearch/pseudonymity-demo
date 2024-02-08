import {createCustomDocumentLoader,} from "../contexts/contexts";
import {credentialResources} from "./multi-actor";
import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
import {AbstractActorFactory, DidVCActorFactory, SolidVCActorFactory} from "../tests/ActorFactory";
import {performance} from "node:perf_hooks";
import {writeJsonFile} from "../utils/io";
import assert  from "node:assert";
import {ICredentialActor} from "../components/interfaces";
function getDocumentLoader(ctx: Map<any,any>) {


    const dl = createCustomDocumentLoader(ctx)
    return (url: string) => {
        console.log({url})
        return dl(url)
    }
}


async function getActors(factory: AbstractActorFactory<any>): Promise<{[p:string]: ICredentialActor}> {

    const entries = []
    for await (const r of cssTestConfigRecords) {
        const a = await factory.createInitializedActor(r)
        entries.push([r.testConfig.name, a as ICredentialActor])

    }


    return Object.fromEntries(entries)
}

/**
 * Objective: find out what causes the difference in verifyPresentation01 between did:key and Solid-only solutions.
 *
 */
async function main() {
    const dlco = {
        HTTP: {
            cacheWebResourcesResolvedFromLocalHostInstances: false,
            cacheWebResourcesResolvedFromTheWeb: false
        },
        DID: {
            cacheResolvedDIDDocs: false
        }
    }
    const solidVCActorFactory = new SolidVCActorFactory(dlco)
    const didVCActorFactory = new DidVCActorFactory(dlco)

    // Select actor factory
    const factory = solidVCActorFactory

    const t0 = Date.now()
    const actors = await getActors(factory)
    const { alice, university, recruiter, government } = actors;


    async function createAndSignDiplomaCredential() {
        // Create & sign diploma credential (university)
        const cDiploma = university.createCredential(credentialResources.diploma.unsigned.credentialSubject)
        cDiploma['@context'] = credentialResources.diploma.unsigned['@context']
        return await university.signCredential(cDiploma)
    }
    const vcDiploma = await createAndSignDiplomaCredential()

    // Derive diploma credential (alice)
    const dvcDiploma = await alice.deriveCredential(vcDiploma, credentialResources.diploma.derivationFrame)

    // Create & sign diploma presentation (alice)
    const challenge = 'hallo'

    const vpDiploma = await alice.signPresentation(
        alice.createPresentation([dvcDiploma], alice.identifier),
        challenge
    )
    async function profileVerifyPresentation01() {
        // Verify diploma presentation (recruiter)
        const tStart = Date.now()
        const verificationResultDiploma = await recruiter.verifyPresentation(vpDiploma, challenge)
        assert(verificationResultDiploma.verified === true)
        const tDelta = Date.now() - tStart
    }
    performance.mark('start verify presentation01')
    await profileVerifyPresentation01()
    performance.mark('end verify presentation01')

    // Create identity credential
    async function createAndSignIdentityCredential() {
        const cIdentity = government.createCredential(credentialResources.identity.unsigned)
        cIdentity['@context'] = credentialResources.identity.unsigned['@context']
        const vcIdentity = government.signCredential(cIdentity)
        return vcIdentity
    }
    const vcIdentity = await createAndSignIdentityCredential()
    // Derive identity credential
    const dvcIdentity = await alice.deriveCredential(vcIdentity, credentialResources.identity.derivationFrame)
    // Create & sign identity presentation
    const vpIdentity = await alice.signPresentation(
        alice.createPresentation([dvcIdentity], alice.identifier),
        challenge
    )
    // Verify identity presentation02
    async function profileVerifyPresentation02() {
        const verificationResultIdentity = await recruiter.verifyPresentation(vpIdentity, challenge)
        assert(verificationResultIdentity.verified === true)
    }

    performance.mark('start verify presentation02')
    await profileVerifyPresentation02()
    performance.mark('end verify presentation02')
    writeJsonFile(`performance-entries.${Object(factory).constructor.name}.json`, performance.getEntries())
}

main().then().catch(console.error)
