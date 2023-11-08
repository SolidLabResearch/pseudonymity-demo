import {ClientCredentials} from "../../interfaces";
import {fetch} from '@inrupt/universal-fetch';

export interface ISolidPod {

}

export interface ISolidActor {
    webId?: string
}
export interface ISolidProxy extends ISolidActor{
    clientCredentials?: ClientCredentials
    controls?: any
    storage?: ISolidPod
    fetch?: typeof fetch
}

export interface IService {
    url: string
}
