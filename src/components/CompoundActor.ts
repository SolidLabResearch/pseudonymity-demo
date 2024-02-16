import {IActor} from "./interfaces";
import {ICredentialActor} from "../interfaces/did";

export class CompoundActor<A1 extends ICredentialActor, A2 extends ICredentialActor> {
    protected a1: A1
    protected a2: A2
    private actors: ICredentialActor[]
    private _activeActorIndex: number = 0

    constructor(a1: A1, a2: A2) {
        this.a1 = a1;
        this.a2 = a2;
        this.actors = [a1, a2]
        this.activeActorIndex = 0 // default to first actor
    }

    get activeActor() {
        return this.actors[this.activeActorIndex]
    }
    set activeActorIndex(value: number) {
        this._activeActorIndex = value;
    }

    get activeActorIndex(): number {
        return this._activeActorIndex;
    }
}

