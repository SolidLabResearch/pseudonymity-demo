// import {ITestRecord} from "../tests/interfaces";
// import {cssTestConfigRecords} from "../tests/config/actorsOnCssTestConfigs";
// import {runEvaluation} from "./evaluator";
// import {SolidVCActorFactory} from "../tests/ActorFactory";
// import {dirProfilingReports, documentLoaderCacheOptions, nIterations, ProfileMode, profileMode} from "./config";
// import {runMultiActorEvaluation} from "./multi-actor";
// import path from "path";
//
//
// switch (profileMode) {
//     case ProfileMode.singleActor:
//         const r = cssTestConfigRecords.find(r => r.testConfig.name === 'alice')! as ITestRecord
//         const actorFactory = new SolidVCActorFactory(documentLoaderCacheOptions)
//         actorFactory.createInitializedActor(r)
//             .then(runEvaluation)
//             .then()
//             .catch(console.error)
//         break
//     case ProfileMode.multiActor:
//         (async () => {
//             const reportStart = Date.now()
//             const reportDir = path.join(dirProfilingReports, `${reportStart}`)
//             const actorFactory = new SolidVCActorFactory(documentLoaderCacheOptions)
//             for(let i = 0; i< nIterations; i++) {
//                 await runMultiActorEvaluation(actorFactory)
//             }
//
//         })().then()
//             .catch(console.error)
//         break;
//     default:
//         throw new Error('Unknown Profile Mode')
// }
