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
import {runMultiActorEvaluation} from "./multi-actor";
import {NotYetImplementedError} from "../components/solid-actor/errors";

// TODO: CLI ARG PARSING NEEDS IMPROVEMENT!!!
const args = process.argv.slice(2);
const cliArgs = {
    nIterations: args.find((arg) => arg.startsWith("--n=")),
    dcloConfigIndex: args.find((arg) => arg.startsWith("--dcloConfig=")),

}

switch (profileMode) {
    case ProfileMode.singleActor:
        throw new NotYetImplementedError('TODO: ProfileMode.singleActor')
        break
    case ProfileMode.multiActor:
        (async () => {

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

        })().then()
            .catch(console.error)
        break;
    default:
        throw new Error('Unknown Profile Mode')
}
