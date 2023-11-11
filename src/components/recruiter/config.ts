throw new Error('Resource paths have changed and need to be updated!')
export const config = {
    name: 'recruiter-service',
    port: 4001,
    derivationFrames: {
        diploma: './actors/recruiter/credentials/derivationFrames/diploma.json',
        identity: './actors/recruiter/credentials/derivationFrames/identity.json'
    }
}
export const origin = `http://localhost:${config.port}`
export const endpoints = {
    recruiter: {
        exchange: {
            diploma: {
                init: `${origin}/exchange/diploma/init`,
                presentationRequest: `${origin}/exchange/diploma/presentation-request`,
                presentation: `${origin}/exchange/diploma/presentation`,
            },
            identity: {
                init: `${origin}/exchange/identity/init`,
                presentationRequest: `${origin}/exchange/identity/presentation-request`,
                presentation: `${origin}/exchange/identity/presentation`,
            }
        }
    }
}
