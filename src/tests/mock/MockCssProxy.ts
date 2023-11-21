import {ISolidProxy} from "../../components/solid-actor/interfaces";
import {fetch} from "@inrupt/universal-fetch";

import {AccessModes} from "@inrupt/solid-client";
import express from 'express';
import path from "path";
import {IncomingMessage, Server, ServerResponse} from "http";

export class MockCssProxy implements ISolidProxy {
    fetch?: typeof fetch;
    webId: string;
    origin: string
    app: express.Application
    server:  Server<typeof IncomingMessage, typeof ServerResponse>
    routes: string[] = []
    controllerDoc: object
    constructor(webId: string, controllerDoc: object) {
        this.fetch = fetch;
        this.webId = webId;
        this.app = express();
        this.controllerDoc = controllerDoc
        const { port,origin,protocol,pathname } = new URL(webId)

        this.origin = origin;
        this.server = this.app.listen(port,)
        this.app.all('/**',(req,res,next)=>{
            const {url, baseUrl , originalUrl} = req
            if(!this.routes.includes(url)) {
                console.log({url, baseUrl , originalUrl, registeredRoutes: this.routes})
                throw new Error(`❌⚠️Requesting unregistered route: ${url}`)
            }

            next()
        })
    }

    addFileToContainer(urlContainer: string, data: Buffer, mimeType: string, slug: string, publicAccess?: AccessModes): Promise<any> {
        const relativeUrlContainer = (new URL(urlContainer)).pathname
        const route = new URL(path.join(relativeUrlContainer, slug), this.origin).pathname

        this.routes.push(route)
        this.app.get(route, (req, res)=>{
            res.writeHead(200, {'content-type':mimeType});
            res.write(data.toString())
            res.end()
        })
        return Promise.resolve(undefined);
    }

    get cardUrl(): string {
        return this.webId.replace('#me','')
    }

    async initialize(): Promise<void> {
        const profileCard = [
            {
                "@id": "http://localhost:3000/alice/profile/card",
                "@type": [
                    "http://xmlns.com/foaf/0.1/PersonalProfileDocument"
                ],
                "http://xmlns.com/foaf/0.1/maker": [
                    {
                        "@id": this.webId
                    }
                ],
                "http://xmlns.com/foaf/0.1/primaryTopic": [
                    {
                        "@id": this.webId
                    }
                ]
            },
            {
                "@id": this.webId,
                "@type": [
                    "http://xmlns.com/foaf/0.1/Person"
                ],
                "http://www.w3.org/ns/solid/terms#oidcIssuer": [
                    {
                        "@id": this.origin
                    }
                ]
            },
            this.controllerDoc
        ]
        await this.addFileToContainer(
            (new URL('profile', this.podUrl)).toString(),
            Buffer.from(JSON.stringify(profileCard)),
            'application/ld+json',
            'card'
        )
        return Promise.resolve(undefined);
    }

    isInitialized(): boolean {
        return false;
    }

    get podUrl(): string {
        return this.webId.replace('profile/card#me', '')
    }
    close() {
        return new Promise((resolve, reject)=>{
            this.server.close((error)=>{
                if(error!!)
                    reject(error)
                resolve({})
            })
        })

    }

}
