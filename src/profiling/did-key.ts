// import {DidVCActor} from "../components/solid-actor/DidVCActor";
// import {runEvaluation} from "./evaluator";
// import {DidVCActorFactory, SolidVCActorFactory} from "../tests/ActorFactory";
// import {dirProfilingReports, documentLoaderCacheOptions, nIterations, profileMode, ProfileMode} from "./config";
// import {runMultiActorEvaluation} from "./multi-actor";
// import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
// import {ITestRecord} from "../tests/interfaces";
// import {DocumentLoaderCacheOptions} from "../contexts/contexts";
// import {writeJsonFile} from "../utils/io";
// import path from "path";
//
//
//
//
// switch (profileMode) {
//     case ProfileMode.singleActor:
//         const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
//         const actorFactory = new DidVCActorFactory(documentLoaderCacheOptions)
//         actorFactory.createInitializedActor(r)
//             .then(runEvaluation)
//             .then()
//             .catch(console.error)
//         break
//     case ProfileMode.multiActor:
//         (async () => {
//             const reportStart = Date.now()
//             const reportDir = path.join(dirProfilingReports, `${reportStart}`)
//             const actorFactory = new DidVCActorFactory(documentLoaderCacheOptions)
//             // We can also export the documentloader cache options (as they will greatly influence the results)
//             const fpathDocumentLoaderCacheOptions = path.join(reportDir, 'documentLoaderCacheOptions.json')
//             writeJsonFile(fpathDocumentLoaderCacheOptions, actorFactory.documentLoaderCacheOptions)
//             for(let i = 0; i< nIterations; i++) {
//                 await runMultiActorEvaluation(actorFactory,reportDir)
//             }
//
//         })().then()
//             .catch(console.error)
//
//         break;
//     default:
//         throw new Error('Unknown Profile Mode')
// }
//
