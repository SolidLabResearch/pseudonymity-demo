import {DocumentLoaderCacheOptions} from "../contexts/contexts";
import {ICredentialActor} from "./did";

export interface IActorMetadata {
    className?: string
    tag?: string
    role?: string
    documentLoaderCacheOptions?: DocumentLoaderCacheOptions
}

export interface IActor extends IActorMetadata {
}

export interface Initializable {
    initialize(): Promise<void>
}

export interface ICompoundCredentialActor extends ICredentialActor {
    enablePublicActor(): void

    enablePseudonymousActor(): void

    setActorMode(mode: 'pseudo' | 'public'): void

    get publicActor(): ICredentialActor

    get pseudonymousActor(): ICredentialActor
}
