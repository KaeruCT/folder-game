export type ItemType = string;
export type Item = {
    type: ItemType;
    quantity: number;
};
export type Inventory = Record<ItemType, Item>;

export function addItem(inventory: Inventory, itemType: ItemType): Inventory {
    const item = inventory[itemType] || { type: itemType, quantity: 0 };
    item.quantity += 1;
    inventory[itemType] = item;
    return inventory;
}

export function removeItem(inventory: Inventory, itemType: ItemType): Inventory {
    const item = inventory[itemType];
    if (item) {
        item.quantity -= 1;
        if (item.quantity === 0) {
            delete inventory[itemType];
        }
    }
    return inventory;
}