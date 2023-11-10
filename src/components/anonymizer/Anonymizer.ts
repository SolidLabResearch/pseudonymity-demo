import {IService, ISolidProxy} from "./interfaces";
import {CssProxy} from "./CssProxy";
import path from "path";
import {joinUrlPaths} from "../../util";
import * as bbs from '@mattrglobal/jsonld-signatures-bbs';
import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from '@mattrglobal/jsonld-signatures-bbs';
// @ts-ignore
import jsigs, {purposes} from 'jsonld-signatures';
import {origin} from "./config";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {logger} from "../../logger";
import {Bls12381G1KeyPair} from "@transmute/did-key-bls12381";
import {klona} from "klona";
import {IDocumentLoader} from "../../contexts/interfaces";
import {BlsKeys} from "../interfaces";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";
import {generateBls12381Keys} from "../../utils/keypair";
import {readJsonFile} from "../../utils/io";

export class Anonymizer {

    keys?: BlsKeys // TODO: make private
    originalKeys?: any
    didDocument?: any
    private proxy: CssProxy
    private anonProxy: ISolidProxy
    private targetService: IService
    private documentLoader: IDocumentLoader
    private signSuite: any

    constructor(proxy: CssProxy, targetService: IService, documentLoader: IDocumentLoader) {
        this.proxy = proxy;
        this.anonProxy = {
            webId: joinUrlPaths(origin, 'anon', 'profile', 'card#me').toString()
        } as ISolidProxy;
        this.targetService = targetService;
        this.documentLoader = documentLoader

    }

    async initialize() {
        logger.debug('initialize()')
        await this.proxy.intializeFetch();
        await this.initializeKeypairs();
        await this.initializeSuites();
    }

    /**
     * Fetches credentials from the user's pod using this.proxy.
     * @param credentialPaths credential filepath(s) relative to the pod's root.
     */
    async getCredentials(credentialPaths: string[]) {
        return await Promise.all(
            credentialPaths
                .map(p => path.join(this.proxy.controls.pod, p))
                .map(p => this.proxy.parsedFetch(p))
        )
    }

    async deriveCredential(vc: any, derivationFrame: any) {
        logger.debug('deriveCredential(vc, derivationFrame)')
        let dvc = undefined;
        try {
            dvc = await bbs.deriveProof(
                vc,
                derivationFrame,
                {
                    suite: new BbsBlsSignatureProof2020(),
                    documentLoader: this.documentLoader
                }
            )
        } catch (error) {
            console.log(error)
        }
        return dvc;
    }

    /**
     * Signs the given verifiable presentation using the Anonymizer's sign suite.
     * @param vp
     * @param purpose
     */
    async signVP(vp: VerifiablePresentation,
                 challenge: string,
                 purpose = new purposes.AssertionProofPurpose()
    ): Promise<VerifiablePresentation> {
        return await jsigs.sign(
            klona(vp), {
                suite: this.signSuite,
                documentLoader: this.documentLoader,
                purpose,
                challenge
            }
        )
    }

    async createVP01(challenge: string) {
        logger.debug('createVP01()')
        const [vc01] = await this.getCredentials(['vc-diploma.jsonld'])
        const derivationFrame = readJsonFile('./actors/recruiter/diploma.jsonld') // TODO: obtain from recruiter
        const dvc01 = await this.deriveCredential(vc01, derivationFrame)
        let vp01 = {
            "@context": [
                'https://w3id.org/security/bbs/v1'
            ],
            holder: this.anonProxy.webId,
            verifiableCredential: [dvc01]
        } as VerifiablePresentation
        // Sign
        vp01 = await this.signVP(vp01, challenge)
        return vp01
    }

    private async initializeKeypairs() {
        logger.debug('initializeKeypairs()')
        const {didDocument, keys: originalKeys} = await generateBls12381Keys('anonymizer-seed')
        this.originalKeys = originalKeys;
        this.didDocument = didDocument;
        console.log(this.originalKeys)
        const keys = Object.fromEntries(originalKeys.map(o => [o.type, o]))

        this.keys = {
            G1: await Bls12381G1KeyPair.from(keys['Bls12381G1Key2020']),
            G2: await Bls12381G2KeyPair.from(keys['Bls12381G2Key2020'])
        }

    }

    private initializeSuites() {
        logger.debug('initializeSuites()')
        this.signSuite = new BbsBlsSignature2020({key: this.keys!.G2})
        this.signSuite = _hack_addEnsureContextFunction(this.signSuite)
    }

}
