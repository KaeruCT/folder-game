import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "./InventoryToast.scss";
import { AppStore } from "../../App";
import { resolveIcon } from "../../model/icons";
import { getItemInfo } from "../../model/items";

function InventoryToast() {
    const { state } = useContext(AppStore);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const prevRef = useRef<Record<string, number>>({});

    // Detect newly added items by comparing current vs previous quantities
    const currentQtys: Record<string, number> = {};
    for (const item of Object.values(state.inventory)) {
        currentQtys[item.type] = item.quantity;
    }

    const addedItems: string[] = [];
    for (const [type, qty] of Object.entries(currentQtys)) {
        const prevQty = prevRef.current[type] ?? 0;
        if (qty > prevQty) {
            addedItems.push(type);
        }
    }
    prevRef.current = currentQtys;

    // Show the most recently added item that isn't dismissed
    const latestAdded = addedItems.length > 0 ? addedItems[addedItems.length - 1] : null;
    const toastId = latestAdded ? `inv-${latestAdded}-${currentQtys[latestAdded]}` : null;

    const dismiss = useCallback(() => {
        if (toastId) {
            setDismissedIds((prev) => {
                const next = new Set(prev);
                next.add(toastId);
                return next;
            });
        }
    }, [toastId]);

    // Auto-dismiss after 6 seconds
    useEffect(() => {
        if (!toastId) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(dismiss, 3000);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [toastId, dismiss]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
                e.preventDefault();
                dismiss();
            }
        },
        [dismiss],
    );

    if (!latestAdded || !toastId || dismissedIds.has(toastId)) return null;

    const info = getItemInfo(latestAdded);

    return (
        <div className="inv-toast" onClick={dismiss} onKeyDown={handleKeyDown} role="status" aria-live="polite">
            <div className="inv-toast__icon">{resolveIcon(info.icon, 20, 1.5)}</div>
            <div className="inv-toast__body">
                <div className="inv-toast__title">Item Acquired</div>
                <div className="inv-toast__name">{info.name}</div>
                <div className="inv-toast__desc">{info.description}</div>
            </div>
            <button
                type="button"
                className="inv-toast__close"
                onClick={(e) => {
                    e.stopPropagation();
                    dismiss();
                }}
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}

export default InventoryToast;
