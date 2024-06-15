import path from "path";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";

const dirReports = path.resolve(__dirname, '../../reports/')
export const dirProfilingReports = path.join(dirReports, 'profiling')

export enum ProfileMode {
    singleActor,
    multiActor
}
export const profileMode : ProfileMode = ProfileMode.multiActor

export const nIterations = 1

export const documentLoaderCacheOptions = {
    DID: {cacheResolvedDIDDocs: true},
    HTTP: {cacheWebResourcesResolvedFromLocalHostInstances: false, cacheWebResourcesResolvedFromTheWeb: true}
} as DocumentLoaderCacheOptions

export const defaultDCLOConfigIndex = 3

export const documentLoaderCacheOptionConfigurations = [
    {
        DID: {
            cacheResolvedDIDDocs: false
        },
        HTTP: {
            cacheWebResourcesResolvedFromLocalHostInstances: false,
            cacheWebResourcesResolvedFromTheWeb: false
        }
    },
    {
        DID: {
            cacheResolvedDIDDocs: true
        },
        HTTP: {
            cacheWebResourcesResolvedFromLocalHostInstances: false,
            cacheWebResourcesResolvedFromTheWeb: false
        }
    },
    {
        DID: {
            cacheResolvedDIDDocs: true
        },
        HTTP: {
            cacheWebResourcesResolvedFromLocalHostInstances: false,
            cacheWebResourcesResolvedFromTheWeb: true
        }
    },
    {
        DID: {
            cacheResolvedDIDDocs: true
        },
        HTTP: {
            cacheWebResourcesResolvedFromLocalHostInstances: true,
            cacheWebResourcesResolvedFromTheWeb: true
        }
    }
]
