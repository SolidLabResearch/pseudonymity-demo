import {DocumentLoaderCacheOptions} from "../contexts/contexts";
import {ICredentialActor} from "../interfaces/did";
import {IActorMetadata, ICompoundCredentialActor} from "../interfaces/actor";

export interface IStepRecord extends ITimeTrackRecord {
    name: string
    index?: number
    output?: any
}

export interface IActorStepRecord
    extends
        IStepRecord,
        IActorMetadata
{}

export interface ITimeTrackRecord {
    start: number
    end: number
    delta: number
}

export interface IActorReport extends ITimeTrackRecord {
    actor: ICredentialActor
    records: IStepRecord[]
    documentLoaderCacheOptions?: DocumentLoaderCacheOptions
}

export interface IMultiActorReport extends ITimeTrackRecord {
    records: IActorStepRecord[],
    documentLoaderCacheOptions?: DocumentLoaderCacheOptions
}

export interface IActorStep {
    actor: ICredentialActor|ICompoundCredentialActor
    f: ICredentialActorStepFunction,
    mode?: 'pseudo'|'public'
}

export interface ICredentialActorStepFunction extends Function {
    (actor: ICredentialActor): Promise<any>

}

export interface IUseCaseActorsSetup {
    documentLoaderCacheOptions: DocumentLoaderCacheOptions
    alice: ICompoundCredentialActor & IActorMetadata
    recruiter: ICredentialActor
    university: ICredentialActor
    government: ICredentialActor
}
