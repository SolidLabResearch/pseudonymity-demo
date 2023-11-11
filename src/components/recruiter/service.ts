import express, {Express, Request, Response} from 'express';
import crypto from 'node:crypto';
import {UUID} from "crypto";
import bodyParser from "body-parser";
import {config, endpoints, origin} from './config'
import {Recruiter} from "./Recruiter";
import {readJsonFile} from "../../utils/io";

const app: Express = express();
app.use(bodyParser.json())
app.use((req, res, next) => {
    const {method, url} = req
    console.log(`${method}\t${url}`)
    next()
})
const exchangeStates: Map<UUID, Array<string>> = new Map()
const recruiter = new Recruiter()

function relPath(x: string): string {
    return x.replace(origin, '')
}

app.get(relPath(endpoints.recruiter.exchange.diploma.init), (req: Request, res: Response) => {
    const exchangeId = crypto.randomUUID();
    exchangeStates.set(exchangeId, ['EXCHANGE_DIPLOMA_INIT'])
    res.send(JSON.stringify({exchangeId, next: endpoints.recruiter.exchange.diploma.presentationRequest}))
})

app.post(relPath(endpoints.recruiter.exchange.diploma.presentationRequest), (req: Request, res: Response) => {
    const {exchangeId} = req.body;
    if (exchangeId!!) {
        exchangeStates.get(exchangeId)?.push('EXCHANGE_DIPLOMA_PRESENTATION_REQUEST')
        const derivationFrame = readJsonFile(config.derivationFrames.diploma)
        res.send(JSON.stringify({derivationFrame, next: endpoints.recruiter.exchange.diploma.presentation}))
    } else {
        res.status(400).send('exchangeId required!')
    }
})

/**
 * Endpoint to POST the diploma VP
 */
app.post(relPath(endpoints.recruiter.exchange.diploma.presentation), async (req: Request, res: Response) => {
    const {exchangeId, verifiablePresentation} = req.body;
    if (exchangeId!! && verifiablePresentation!!) {
        exchangeStates.get(exchangeId)?.push('EXCHANGE_DIPLOMA_PRESENTATION')

        const challenge = 'ch4ll3ng3' // TODO!!!
        const verificationResult = await recruiter.verify(verifiablePresentation, challenge)

        if (verificationResult.verified) {
            // VP01 is valid.
            // Update exchange state
            exchangeStates.get(exchangeId)?.push('EXCHANGE_DIPLOMA_PRESENTATION_VALID')
            // Return verification result & the URL for the next phase
            res.send(JSON.stringify({
                verificationResult,
                next: endpoints.recruiter.exchange.identity.init
            }))
        } else {
            // VP01 is INVALID
            // Return error code
            res.status(400).send(JSON.stringify({
                verificationResult
            }))
        }
    } else {
        res.status(400).send('exchangeId and verifiablePresentation are required!')
    }
})

/**
 * Phase 2: identity verification
 */
app.post(relPath(endpoints.recruiter.exchange.identity.init), (req: Request, res: Response) => {
    const {exchangeId} = req.body;

    if (exchangeId!! && exchangeStates.get(exchangeId)?.includes('EXCHANGE_DIPLOMA_PRESENTATION_VALID')) {
        exchangeStates.get(exchangeId)!.push('EXCHANGE_IDENTITY_INIT')
    }

    res.send(JSON.stringify({exchangeId, next: endpoints.recruiter.exchange.identity.presentationRequest}))
})

app.post(relPath(endpoints.recruiter.exchange.identity.presentationRequest), (req: Request, res: Response) => {
    const {exchangeId} = req.body;
    if (exchangeId!!) {
        exchangeStates.get(exchangeId)?.push('EXCHANGE_IDENTITY_PRESENTATION_REQUEST')
        const derivationFrame = readJsonFile(config.derivationFrames.identity)
        res.send(JSON.stringify({derivationFrame, next: endpoints.recruiter.exchange.identity.presentation}))
    } else {
        res.status(400).send('exchangeId required!')
    }
})

/**
 * Endpoint to POST the identity VP
 */
app.post(relPath(endpoints.recruiter.exchange.identity.presentation), async (req: Request, res: Response) => {
    const {exchangeId, verifiablePresentation} = req.body;
    if (exchangeId!! && verifiablePresentation!!) {
        exchangeStates.get(exchangeId)?.push('EXCHANGE_IDENTITY_PRESENTATION')

        const challenge = 'ch4ll3ng3' // TODO!!!
        const verificationResult = await recruiter.verify(verifiablePresentation, challenge)

        if (verificationResult.verified) {
            // VP02 is valid.
            // Update exchange state
            exchangeStates.get(exchangeId)?.push('EXCHANGE_IDENTITY_PRESENTATION_VALID')
            // Return verification result & the URL for the next phase
            res.send(JSON.stringify({
                verificationResult,
                // TODO: next?
            }))
        } else {
            // VP02 is INVALID
            // Return error code
            res.status(400).send(JSON.stringify({
                verificationResult
            }))
        }
    } else {
        res.status(400).send('exchangeId and verifiablePresentation are required!')
    }
})


app.listen(config.port, () => {
    console.log(`⚡️[${config.name}]: Server is running at http://localhost:${config.port}`);

})
