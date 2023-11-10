export interface ICssTestConfig {
    port: number
}


export type ActorName = string

export interface IActorOnCssTestConfig {
    [name: ActorName]: ICssTestConfig
}

export const actorsOnCssTestConfigs: IActorOnCssTestConfig = {
    alice: {port: 4000},
    recruiter: {port: 4001},
}
