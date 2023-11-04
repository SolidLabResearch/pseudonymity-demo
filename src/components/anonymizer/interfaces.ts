import {ClientCredentials} from "../../interfaces";
import {fetch} from '@inrupt/universal-fetch';

export interface ISolidPod {

}

export interface ISolidProxy {
    webId?: string
    clientCredentials?: ClientCredentials
    controls?: any
    storage?: ISolidPod
    fetch?: typeof fetch
}

export interface IService {
    url: string
}
