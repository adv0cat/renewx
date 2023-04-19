export const concatStores = <T>(first: T, second: T, others: T[]): T[] => {
    const result = [first, second]
    return others.length === 0 ? result : result.concat(others)
}
