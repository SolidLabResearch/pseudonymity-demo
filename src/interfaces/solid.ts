import {ClientCredentials} from "../interfaces";
import {AccessModes, SolidDataset, ThingBuilder} from "@inrupt/solid-client";

import {IActor, Initializable} from "./actor";

export interface ISolidPod {
}

export interface ISolidActor extends IActor {
    webId: string
}

export interface ISolidProxy
    extends ISolidActor,
        Initializable {
    clientCredentials?: ClientCredentials
    controls?: any
    storage?: ISolidPod
    fetch?: typeof fetch

    // initialize(): Promise<void>/**/

    get cardUrl(): string

    get podUrl(): string

    addFileToContainer(
        urlContainer: string,
        data: Buffer,
        mimeType: string,
        slug: string,
        publicAccess?: AccessModes
    ): Promise<any>

    getThingBuilder(name: string): ThingBuilder<any>

    getProfileBuilder(): Promise<ThingBuilder<any>>

    getCard(): Promise<SolidDataset>

    updateCard(cardUpdate: SolidDataset): Promise<void>
}
