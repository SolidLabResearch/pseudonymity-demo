import {ClientCredentials} from "../../interfaces";

export interface ISolidPod {

}

export interface ISolidProxy {
    webId?: string
    clientCredentials?: ClientCredentials
    storage?: ISolidPod
    fetch?: Function
}

export interface IService {
    url: string
}
