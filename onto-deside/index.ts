import {AbstractActorFactory} from "../src/tests/ActorFactory";
import {DocumentLoaderCacheOptions} from "../src/contexts/contexts";
import {ITestRecord} from "../src/tests/interfaces";
import {obtainClientCredentialsV2} from "../src/utils/css";
import {SolidVCActor} from "../src/components/solid-actor/SolidVCActor";
import {CssProxy} from "../src/components/solid-actor/CssProxy";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {getThing} from "@inrupt/solid-client";
import {ttl2jld} from "../src/utils/parsing";
import n3, {Quad} from "n3";
import {N3Parser} from "rdflib";

function createTestRecord(name: string, port: number, email: string, password: string): ITestRecord {

    const css = `http://localhost:${port}`
    return {
        testConfig: { name, port },
        userConfig: {
            podName: name,
            email,
            password,
            css,
            webId: `${css}/${name}/profile/card#me`,
            createPod: false,
            createWebId: false,
            register: false
        }
    }
}



const cacheOptions : DocumentLoaderCacheOptions = {
    DID: { cacheResolvedDIDDocs: false },
    HTTP: { cacheWebResourcesResolvedFromTheWeb: false, cacheWebResourcesResolvedFromLocalHostInstances: false }
}

class TempSolidVCActorFactory extends AbstractActorFactory<SolidVCActor> {

    constructor(documentLoaderCacheOptions: DocumentLoaderCacheOptions) {
        super(documentLoaderCacheOptions);
    }

    async createInitializedActor(r: ITestRecord): Promise<SolidVCActor> {
        /**
         * CSS7.x client credentials docs:
         * https://communitysolidserver.github.io/CommunitySolidServer/latest/usage/client-credentials/
         */
        const urlAccount = `${r.userConfig.css}/.account/`
        const { userConfig: { webId }} = r;
        const cc = await obtainClientCredentialsV2(
            urlAccount,
            webId,
            r.userConfig.email,
            r.userConfig.password
        )

        // CSS Proxy
        const proxy = new CssProxy(cc, webId)

        // Generate BLS12381 G2 Key using a seed
        const seed = Uint8Array.from(Buffer.from(
            webId
            +r.userConfig.email
            +r.userConfig.password)
        )
        const keyName = "key"
        const controllerId = webId.replace('#me','')
        const keyId = `${controllerId}#${keyName}`;
        const key = await Bls12381G2KeyPair.generate({
            id: keyId,
            seed,
            controller: controllerId
        })

        // Instantiate actor
        const a = new SolidVCActor(
            key,
            keyName,
            this.documentLoader,
            proxy
        )
        // Initialize actor
        await a.initialize()
        return a
    }

}
/**
 * Required changes to onto-deside/architecture
 *
 * - yarn install, ..., source envars3, ..
 * - ./scripts/templates/apply-templates.sh
 * - manual changes to docker compose3.yml file
 *  -  add port binding to css5 entry in
 *  - commented out css5's network_mode
 * - updated architecture/common/css-01.json
 *      - changed identity handler config to:
 *          "css:config/identity/handler/default.json",
 * and then:
 *  docker compose --profile backend -f docker-compose3.yml up --wait
 *
 * or only boot up CSS5 while testing
 *  docker compose --profile css5 -f docker-compose3.yml up --wait
 *
 *  @example output
 * Components data:
 *
 * <https://www.example/com/textile-data/component-c01> a <https://www.example/com/textile-ont/Component>;
 *   <https://www.example/com/textile-ont/has-component-bom> <https://www.example/com/textile-data/component-bom-b01>;
 *   <https://www.example/com/textile-ont/name> "SPO Bio";
 *   <https://www.example/com/textile-ont/recycled-content-percentage> 80 .
 *
 * <https://www.example/com/textile-data/component-c02> a <https://www.example/com/textile-ont/Component>;
 *   <https://www.example/com/textile-ont/has-component-bom> <https://www.example/com/textile-data/component-bom-b02>;
 *   <https://www.example/com/textile-ont/name> "REF 2.0";
 *   <https://www.example/com/textile-ont/recycled-content-percentage> 20 .
 *
 * <https://www.example/com/textile-data/component-c03> a <https://www.example/com/textile-ont/Component>;
 *   <https://www.example/com/textile-ont/has-component-bom> <https://www.example/com/textile-data/component-bom-b03>;
 *   <https://www.example/com/textile-ont/name> "ECO 1";
 *   <https://www.example/com/textile-ont/recycled-content-percentage> 0 .
 *
 * Verifiable Credential for: https://www.example/com/textile-data/component-c01
 * {
 *   '@context': [
 *     'https://www.w3.org/2018/credentials/v1',
 *     'https://w3id.org/security/bbs/v1'
 *   ],
 *   type: [ 'VerifiableCredential' ],
 *   issuer: 'http://localhost:3005/texon/profile/card#me',
 *   credentialSubject: {
 *     id: 'https://www.example/com/textile-data/component-c01',
 *     'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'https://www.example/com/textile-ont/Component',
 *     'https://www.example/com/textile-ont/has-component-bom': 'https://www.example/com/textile-data/component-bom-b01',
 *     'https://www.example/com/textile-ont/name': 'SPO Bio',
 *     'https://www.example/com/textile-ont/recycled-content-percentage': '80'
 *   },
 *   proof: {
 *     type: 'BbsBlsSignature2020',
 *     created: '2024-01-26T12:01:12Z',
 *     proofPurpose: 'assertionMethod',
 *     proofValue: 'uSwAmNIsM7K0UHZKLs6UY6NzNr9YrhOULo2hhgtZT20AOxVs2ArQnBwiS7iG6jeDZHJvLM77NRjJCTzaPieOQDn3E0Mc5AJ3rVN9bcKn+XZhA94DNtOkxuUUQxqrGtbs5lCoArFFTeWZo3t0qJ/v4g==',
 *     verificationMethod: 'http://localhost:3005/texon/profile/card#key'
 *   }
 * }
 * { verified: true, results: [ { proof: [Object], verified: true } ] }
 */
async function main() {
    console.log((new Date()).toLocaleString('be-BE'))
    // Factory that helps to create VC actors
    const factory = new TempSolidVCActorFactory(cacheOptions)

    // Record with actor configuration
    const record = createTestRecord('texon',
        3005, 'info@texon.com', 'texon123')

    // Create initialized VC actor
    const actor = await factory.createInitializedActor(record)

    // Get Texon's components data
    const urlTexonDataComponents = 'http://localhost:3005/texon/data/dt/out/components.ttl'
    const componentsTtl = await (await actor.proxy.fetch!(urlTexonDataComponents)).text()
    console.log('Components data:\n', componentsTtl)
    const store = new n3.Store(new n3.Parser({format: 'text/turtle'}).parse(componentsTtl))
    // For this particular example, each subject represents a component from Texon
    const subjects = store.getSubjects(null, null, null)

    // TODO: iterate over each subject, match their predicate objects, and create a VC from them
    // Select first subject
    const si = subjects[0]
    // Get quads for this subject
    console.log(`Verifiable Credential for: ${si.value}`)
    const quads = store.getQuads(si, null, null, null)
    // Use si's quads to construct credential payload (i.e., CredentialSubject)
    const credentialSubject = {
        id: si.value,
        ...Object.fromEntries(quads.map(q => [q.predicate.value, q.object.value]))
    }
    // Create credential
    const ci = actor.createCredential(credentialSubject)
    // Create Verifiable Credential (by signing credential ci)
    const vci = await actor.signCredential(ci)
    console.log(vci)
    // Let's check whether we can verify the newly created vci
    const vri = await actor.verifyCredential(vci)
    console.log(vri)
}

main()
    .then()
    .catch(console.error)
