const idCounter = (): (name: string | number | undefined) => string | number => {
    let id = 0
    return (name) => name ?? ++id
}

export const nextStoreId = idCounter()
export const nextActionId = idCounter()
export const nextJobId = idCounter()
