import path from "path";

const dirReports = path.resolve(__dirname, '../../reports/')
export const dirProfilingReports = path.join(dirReports, 'profiling')

export enum ProfileMode {
    singleActor,
    multiActor

}
export const profileMode : ProfileMode = ProfileMode.multiActor
