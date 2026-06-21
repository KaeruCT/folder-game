export type ItemType = string;
type Item = {
    type: ItemType;
    quantity: number;
};
export type Inventory = Record<ItemType, Item>;

export function addItem(inventory: Inventory, itemType: ItemType): Inventory {
    const existing = inventory[itemType];
    return {
        ...inventory,
        [itemType]: { type: itemType, quantity: (existing?.quantity ?? 0) + 1 },
    };
}

export function removeItem(inventory: Inventory, itemType: ItemType): Inventory {
    const item = inventory[itemType];
    if (!item) return inventory;

    if (item.quantity <= 1) {
        const { [itemType]: _, ...rest } = inventory;
        return rest;
    }

    return {
        ...inventory,
        [itemType]: { ...item, quantity: item.quantity - 1 },
    };
}
