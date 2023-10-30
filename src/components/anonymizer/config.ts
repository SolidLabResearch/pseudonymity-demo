export const config = {
    name: 'anonymizer-service',
    port: 4002,
}
export const origin = `http://localhost:${config.port}`
export const endpoints = {
    anonymizer: {
        exchange: {
            diploma: {
                init: `${origin}/exchange/diploma/init`,
            },
            identity: {
                init: `${origin}/exchange/identity/init`,
            }
        }
    }
}
