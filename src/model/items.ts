/**
 * Global registry of all items used across storylines.
 * Maps the internal item type string to display info.
 * `icon` is a Lucide icon component name (e.g. "BookOpen", "Key").
 */
export interface ItemInfo {
    /** Display name shown in inventory and toasts */
    name: string;
    /** What the item does or where it came from */
    description: string;
    /** Lucide icon component name */
    icon: string;
}

const ITEM_REGISTRY: Record<string, ItemInfo> = {
    // ── The Echoes Below ──
    diary_key: {
        name: "Diary Key",
        description: "Unlocks Frank's private diary directory",
        icon: "BookOpen",
    },
    expedition_clearance: {
        name: "Expedition Clearance",
        description: "Grants access to restricted Hollow Earth expedition reports",
        icon: "ClipboardList",
    },
    echo_cipher: {
        name: "Echo Cipher",
        description: "Decryption key for the Path of Echoes sacred texts",
        icon: "Fingerprint",
    },
    kael_contact: {
        name: "Kael's Contact Credentials",
        description: "Unlocks messages from the mysterious inner-world contact",
        icon: "MessageCircle",
    },

    // ── The Lockdown (legacy) ──
    diary_entry: {
        name: "Diary Entry Key",
        description: "Unlocks Evan's personal diary entries",
        icon: "BookOpen",
    },
    sys: {
        name: "System Access",
        description: "Unlocks restricted system directories",
        icon: "Settings",
    },
};

/** Fallback info for items not in the registry. */
const UNKNOWN_ITEM: ItemInfo = {
    name: "Unknown Item",
    description: "An unregistered item",
    icon: "HelpCircle",
};

export function getItemInfo(type: string): ItemInfo {
    return ITEM_REGISTRY[type] ?? UNKNOWN_ITEM;
}
