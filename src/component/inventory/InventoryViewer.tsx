import { useContext, useMemo } from "react";
import "./InventoryViewer.scss";
import { AppStore } from "../../App";
import { resolveIcon } from "../../model/icons";
import { getItemInfo } from "../../model/items";

interface Props {
    overlay?: boolean;
}

function InventoryViewer({ overlay }: Props) {
    const { state } = useContext(AppStore);
    const items = useMemo(() => Object.values(state.inventory), [state.inventory]);

    const body = (() => {
        if (items.length === 0) {
            return (
                <div className="inv-empty">
                    <p className="inv-empty__text">
                        Your inventory is empty. Explore the filesystem to find keys and items.
                    </p>
                </div>
            );
        }

        return (
            <div className="item-list">
                {items.map((item) => {
                    const info = getItemInfo(item.type);
                    return (
                        <div key={item.type} className="inventory-item">
                            <div className="inventory-item__icon">{resolveIcon(info.icon, 20)}</div>
                            <div className="inventory-item__body">
                                <div className="inventory-item__name">{info.name}</div>
                                <div className="inventory-item__desc">{info.description}</div>
                            </div>
                            {item.quantity > 1 && <div className="inventory-item__qty">{item.quantity}</div>}
                        </div>
                    );
                })}
            </div>
        );
    })();

    if (overlay) return <>{body}</>;

    return (
        <div className="window inventory">
            <div className="content">{body}</div>
        </div>
    );
}

export default InventoryViewer;
