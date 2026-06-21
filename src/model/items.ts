export interface ItemInfo {
    /** Display name shown in inventory and toasts */
    name: string;
    /** What the item does or where it came from */
    description: string;
    /** Emoji icon for the item */
    icon: string;
}

/**
 * Global registry of all items used across storylines.
 * Maps the internal item type string to display info.
 */
const ITEM_REGISTRY: Record<string, ItemInfo> = {
    // ── The Echoes Below ──
    diary_key: {
        name: "Diary Key",
        description: "Unlocks Frank's private diary directory",
        icon: "📔",
    },
    expedition_clearance: {
        name: "Expedition Clearance",
        description: "Grants access to restricted Hollow Earth expedition reports",
        icon: "📋",
    },
    echo_cipher: {
        name: "Echo Cipher",
        description: "Decryption key for the Path of Echoes sacred texts",
        icon: "🔮",
    },
    kael_contact: {
        name: "Kael's Contact Credentials",
        description: "Unlocks messages from the mysterious inner-world contact",
        icon: "🌑",
    },

    // ── The Libertine's Ledger ──
    vault_key: {
        name: "Vault Key",
        description: "Unlocks Vincenzo's private diary and photo gallery",
        icon: "🔐",
    },
    ledger_key: {
        name: "Ledger Key",
        description: "Grants access to Vincenzo's black book and business connections",
        icon: "📒",
    },

    // ── The Lockdown (legacy) ──
    diary_entry: {
        name: "Diary Entry Key",
        description: "Unlocks Evan's personal diary entries",
        icon: "🔓",
    },
    sys: {
        name: "System Access",
        description: "Unlocks restricted system directories",
        icon: "⚙️",
    },
};

/** Fallback info for items not in the registry. */
const UNKNOWN_ITEM: ItemInfo = {
    name: "Unknown Item",
    description: "An unregistered item",
    icon: "❓",
};

export function getItemInfo(type: string): ItemInfo {
    return ITEM_REGISTRY[type] ?? UNKNOWN_ITEM;
}
