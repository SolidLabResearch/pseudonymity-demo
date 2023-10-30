import {IService, ISolidProxy} from "./interfaces";
export class Anonymizer {
    private proxy: ISolidProxy
    private anonProxy: ISolidProxy
    private targetService : IService
    constructor(a: ISolidProxy, targetService: IService) {
        this.proxy = a;
        this.anonProxy = {} as ISolidProxy;
        this.targetService = targetService;
    }
}
