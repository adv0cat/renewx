import type { StoreID } from "../interfaces/store";

export const getStoreId = (storeID: string | number): StoreID => Number.isInteger(storeID)
    ? `store-${ storeID as number }`
    : `${ storeID as string }Store`
