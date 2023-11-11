export interface ClientCredentials {
    id: string;
    secret: string;
}

export interface CssUserConfig {
    podName: string
    email: string
    password: string
    createWebId: boolean
    createPod: boolean
    register: boolean
    webId: string
    css: string
}


export interface CssControlsApiResponse {
    "main": {
        "index": string
        "logins": string
    }
    "account": {
        "create": string
        "logout": string
        "webId": string
        "pod": string
        "clientCredentials": string
    }
    "password": {
        "create": string
        "login": string
        "forgot": string
        "reset": string
    }
    "oidc": {
        "cancel": string
        "prompt": string
        "webId": string
        "forgetWebId": string
        "consent": string
    },
    "html": {
        "main": {
            "login": string
        },
        "account": {
            "createClientCredentials": string
            "createPod": string
            "linkWebId": string
            "account": string
        },
        "password": {
            "register": string
            "login": string
            "create": string
            "forgot": string
        }
    }
}
