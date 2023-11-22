import {ICredentialActor} from "../components/solid-actor/interfaces";

export interface IStepRecord extends ITimeTrackRecord {
    name: string
    index?: number
}

export interface ITimeTrackRecord {
    start: number
    end: number
    delta: number
}

export interface IActorReport extends ITimeTrackRecord {
    actor: ICredentialActor
    records: IStepRecord[]
}
