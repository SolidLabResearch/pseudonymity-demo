import {IInitializableActor} from "../interfaces";

export abstract class KeyPairActor<K> implements Partial<IInitializableActor> {
    key?: K

    // abstract initialize(): Promise<void>

    isInitialized(): boolean {
        return this.key !== undefined
    }

}
