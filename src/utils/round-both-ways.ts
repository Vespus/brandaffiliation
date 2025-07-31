export const roundBothWays = (n: number) => {
    if (Number.isInteger(n)) {
        return [n]
    } else {
        return [Math.floor(n), Math.ceil(n)]
    }
}
