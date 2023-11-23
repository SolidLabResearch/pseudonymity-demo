import {IActorMetadata, ICredentialActor} from "../components/solid-actor/interfaces";

export interface IStepRecord extends ITimeTrackRecord {
    name: string
    index?: number
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
}

export interface IMultiActorReport extends ITimeTrackRecord {
    records: IActorStepRecord[]
}

export interface IActorStep {
    actor: ICredentialActor
    f: ICredentialActorStepFunction
}

export interface ICredentialActorStepFunction extends Function {
    (actor: ICredentialActor): Promise<any>

}
