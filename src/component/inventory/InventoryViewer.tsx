import { useContext, useMemo } from "react";
import "./InventoryViewer.scss";
import { AppStore } from "../../App";
import { getItemInfo } from "../../model/items";

function InventoryViewer() {
    const { state } = useContext(AppStore);
    const items = useMemo(() => Object.values(state.inventory), [state.inventory]);

    if (items.length === 0) {
        return (
            <div className="window inventory">
                <div className="content inv-empty">
                    <div className="inv-empty__icon">🎒</div>
                    <p className="inv-empty__text">
                        Your inventory is empty. Explore the filesystem to find keys and items.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="window inventory">
            <div className="content item-list">
                {items.map((item) => {
                    const info = getItemInfo(item.type);
                    return (
                        <div key={item.type} className="inventory-item">
                            <div className="inventory-item__icon">{info.icon}</div>
                            <div className="inventory-item__body">
                                <div className="inventory-item__name">{info.name}</div>
                                <div className="inventory-item__desc">{info.description}</div>
                            </div>
                            {item.quantity > 1 && <div className="inventory-item__qty">{item.quantity}</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default InventoryViewer;
