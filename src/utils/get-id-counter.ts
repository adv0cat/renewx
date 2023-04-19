export const getIDCounter = (LIMIT = Number.MAX_SAFE_INTEGER - 1) => {
    let id = 0
    return {
        newID: () => {
            if (id === LIMIT) {
                id = 0
            }
            return ++id
        }
    }
}
