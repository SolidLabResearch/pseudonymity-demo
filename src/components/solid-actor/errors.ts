export class NotYetImplementedError extends Error { // TODO: REFACTOR
    constructor(props?: string) {
        super("Not Yet Implemented!\n" + props);
    }
}

export class NotInitializedError extends Error { // TODO: REFACTOR
    constructor(props?: string) {
        super("Instance has not yet been Initialized!\n" + props);
    }
}
