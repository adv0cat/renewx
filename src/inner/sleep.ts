export const sleep = async (ms = 0): Promise<void> => new Promise((r) => setTimeout(r, ms))
