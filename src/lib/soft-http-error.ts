export class SoftHttpError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'SoftHttpErrorInstance'
    }
}
