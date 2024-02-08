import {DocumentLoaderCacheOptions} from "../contexts/contexts";
import {IActorMetadata, ICredentialActor} from "../components/interfaces";

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

export interface ICompoundCredentialActor extends ICredentialActor { // TODO: refactor to interfaces.ts
    enablePublicActor(): void

    enablePseudonymousActor(): void

    setActorMode(mode: 'pseudo' | 'public'): void

    get publicActor(): ICredentialActor

    get pseudonymousActor(): ICredentialActor
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
