import {
    defaultDCLOConfigIndex,
    dirProfilingReports,
    documentLoaderCacheOptionConfigurations,
    nIterations,
    ProfileMode,
    profileMode
} from "./config";
import {DidVCActorFactory, SolidVCActorFactory} from "../tests/ActorFactory";
import path from "path";
import {runMultiActorEvaluation, runMultiActorEvaluationV2} from "./multi-actor";
import {NotYetImplementedError} from "../components/solid-actor/errors";
import {initializeUseCaseActorsForThirdPartyServiceSolution} from "./third-party-pseudonymizer";
import {initializeUseCaseActorsForDidKeySolution} from "./did-key-pseudonymizer";

// TODO: CLI ARG PARSING NEEDS IMPROVEMENT!!!
const args = process.argv.slice(2);
const cliArgs = {
    nIterations: args.find((arg) => arg.startsWith("--n=")),
    dcloConfigIndex: args.find((arg) => arg.startsWith("--dcloConfig=")),
    solution: args.find((arg) => arg.startsWith("--solution=")),

}

async function multiActorRunV1() {
    const N = cliArgs.nIterations! ? parseInt(cliArgs.nIterations!.split('=')[1]) :  nIterations
    const dcloConfigIndex = parseInt(cliArgs.dcloConfigIndex!.split('=')[1]) ?? defaultDCLOConfigIndex

    const reportStart = Date.now()
    const reportDir = path.join(dirProfilingReports, `${reportStart}`)

    const dclo = documentLoaderCacheOptionConfigurations[dcloConfigIndex]
    const actorFactories = [
        new SolidVCActorFactory(dclo),
        new DidVCActorFactory(dclo)
    ]

    console.log(`
            Nr. iterations: ${N}
            DocumentLoaderCacheOptionConfiguration: ${JSON.stringify(dclo)}
            `)
    for(let i = 0; i< N; i++) {
        console.log(`Iteration: ${i}`)
        await runMultiActorEvaluation(
            actorFactories,
            reportDir
        )
    }

}

async function profileThirdPartyServiceSolution() {
    const N = cliArgs.nIterations! ? parseInt(cliArgs.nIterations!.split('=')[1]) :  nIterations
    const dcloConfigIndex = parseInt(cliArgs.dcloConfigIndex!.split('=')[1]) ?? defaultDCLOConfigIndex

    const reportStart = Date.now()
    const reportDir = path.join(dirProfilingReports, `${reportStart}`)

    const dclo = documentLoaderCacheOptionConfigurations[dcloConfigIndex]


    console.log(`
            Nr. iterations: ${N}
            DocumentLoaderCacheOptionConfiguration: ${JSON.stringify(dclo)}
            `)
    const usecaseActors = await initializeUseCaseActorsForThirdPartyServiceSolution(dclo)
    for(let i = 0; i< N; i++) {
        console.log(`Iteration: ${i}`)
        await runMultiActorEvaluationV2(
            usecaseActors,
            reportDir
        )
    }
}

async function profileDidKeySolution() {
    const N = cliArgs.nIterations! ? parseInt(cliArgs.nIterations!.split('=')[1]) :  nIterations
    const dcloConfigIndex = parseInt(cliArgs.dcloConfigIndex!.split('=')[1]) ?? defaultDCLOConfigIndex

    const reportStart = Date.now()
    const reportDir = path.join(dirProfilingReports, `${reportStart}`)

    const dclo = documentLoaderCacheOptionConfigurations[dcloConfigIndex]


    console.log(`
            Nr. iterations: ${N}
            DocumentLoaderCacheOptionConfiguration: ${JSON.stringify(dclo)}
            `)
    const usecaseActors = await initializeUseCaseActorsForDidKeySolution(dclo)
    for(let i = 0; i< N; i++) {
        console.log(`Iteration: ${i}`)
        await runMultiActorEvaluationV2(
            usecaseActors,
            reportDir
        )
    }
}
switch (profileMode) {
    case ProfileMode.singleActor:
        throw new NotYetImplementedError('TODO: ProfileMode.singleActor')
        break
    case ProfileMode.multiActor:
        multiActorRunV1().then()
            .catch(console.error)
        break;
    case ProfileMode.multiActorV2:
        const solution = cliArgs.solution!.split('=')[1]
        switch (solution) {
            case 'third-party':
                profileThirdPartyServiceSolution().then().catch(console.error)
                break;
            case 'did-key':
                profileDidKeySolution().then().catch(console.error)
                break
            default:
                throw Error('Fix me')
        }
        break

    default:
        throw new Error('Unknown Profile Mode')
}
