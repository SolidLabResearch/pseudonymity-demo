import assert from 'node:assert';
import {fetchJson, readJsonFile} from "../../util";

import {endpoints} from '../../components/recruiter/config';
import {TestResult} from "../TestResult";


/**
 * Note: currently only happy path tests are defined
 */
let globals = {
    exchangeId: undefined,
    diploma: {
        derivationFrame: undefined
    },
    identity: {
        derivationFrame: undefined
    }
}

const phase1Tests = {
    'Initiating the exchange of diploma generates and returns a new exchangeId and the path to the next endpoint': async ()=> {
        const {exchangeId, next} = await fetchJson(endpoints.recruiter.exchange.diploma.init, {
            method: 'GET',
        })
        assert(exchangeId!!)
        assert(next!!)
        assert(endpoints.recruiter.exchange.diploma.presentationRequest.endsWith(next))
        globals.exchangeId = exchangeId;
    },
    'After initiating diploma exchange, a derivation frame is returned (which serves as the presentation request)': async ()=> {
        let {derivationFrame, next} = await fetchJson(endpoints.recruiter.exchange.diploma.presentationRequest, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                exchangeId: globals.exchangeId
            })
        })

        assert(derivationFrame!!)
        assert(next!!)
        assert(endpoints.recruiter.exchange.diploma.presentation.endsWith(next))

        // Testing the contents of the derivation frame
        const {type, credentialSubject} = derivationFrame;
        assert(type.includes('VerifiableCredential'))
        assert(type.includes('UniversityDegreeCredential'))
        assert(credentialSubject.degree!!)
        globals.diploma.derivationFrame = derivationFrame
    },
    'Verifies VP01': async ()=> {
        const exportedState = readJsonFile('./all.json')
        const { vp1 } = exportedState;
        const verifiablePresentation = vp1

        const response = await fetch(endpoints.recruiter.exchange.diploma.presentation, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                exchangeId: globals.exchangeId,
                verifiablePresentation
            })
        })

        const {verificationResult, next} = await response.json();
        assert(verificationResult!!)
        const { verified, error} = verificationResult;
        console.log(JSON.stringify(error, null, 2))
        assert(verified)
        assert(endpoints.recruiter.exchange.identity.init.endsWith(next))
    },
}

const phase2Tests = {
    'Initiating the exchange of identity returns the path to the next endpoint': async ()=> {
        const {next} = await fetchJson(endpoints.recruiter.exchange.identity.init, {
            method: 'POST',
        })
        assert(next!!)
        assert(endpoints.recruiter.exchange.identity.presentationRequest.endsWith(next))
    },
    'After initiating identity exchange, a derivation frame is returned (which serves as the presentation request)': async ()=> {
        let {derivationFrame, next} = await fetchJson(endpoints.recruiter.exchange.identity.presentationRequest, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                exchangeId: globals.exchangeId
            })
        })

        assert(derivationFrame!!)
        assert(next!!)
        assert(endpoints.recruiter.exchange.identity.presentation.endsWith(next))

        // Testing the contents of the derivation frame
        const {type, credentialSubject} = derivationFrame;
        assert(type.includes('VerifiableCredential'))
        assert(credentialSubject['solid:webid']!!)
        globals.identity.derivationFrame = derivationFrame
    },
    'Verifies VP02': async ()=> {
        const exportedState = readJsonFile('./all.json')
        const verifiablePresentation = exportedState.vp2;
        const response = await fetch(endpoints.recruiter.exchange.identity.presentation, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                exchangeId: globals.exchangeId,
                verifiablePresentation
            })
        })

        const {verificationResult, next} = await response.json();
        assert(verificationResult!!)
        const { verified, error} = verificationResult;
        console.log(JSON.stringify(error, null, 2))
        assert(verified)
        // TODO: assert value of next?
    },
}
const tests = {
    ...phase1Tests,
    ...phase2Tests
}

async function run() {
    const testResults= new Array<TestResult>()
    let i = 0;

    for await (const [n,t] of Object.entries(tests)) {
        let e : any;

        console.log(n)
        try {
            await t()
        } catch (error) {
            e = error;
        } finally {
            testResults.push({name: n, passed: !e!!, error: e})
        }
    }
    testResults.forEach((tr: TestResult, i: number) => {
        console.log(tr)
    })
}
run().then().catch(console.error)
