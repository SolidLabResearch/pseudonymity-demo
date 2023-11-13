import {IActor} from "./interfaces";

export class CompoundActor<A1 extends IActor, A2 extends IActor> implements IActor {
    protected a1: A1
    protected a2: A2
    private actors: IActor[]

    constructor(a1: A1, a2: A2) {
        this.a1 = a1;
        this.a2 = a2;
        this.actors = [a1, a2]
    }

    async initialize(): Promise<void> {
        await Promise.all(
            this.actors.map(a => a.initialize())
        )
    }

    isInitialized(): boolean {
        return this.actors
            .map(a => a.isInitialized())
            .every(b => b)
    }
}
