import {ClientCredentials} from "../../interfaces";

export interface ISolidPod {

}

export interface ISolidProxy {
    webId?: string
    clientCredentials?: ClientCredentials
    controls?: any
    storage?: ISolidPod
    fetch?: Function
}

export interface IService {
    url: string
}
