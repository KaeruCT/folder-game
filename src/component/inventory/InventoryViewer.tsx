import { useContext, useMemo } from "react";
import "./InventoryViewer.scss";
import { AppStore } from "../../App";

function InventoryViewer() {
    const { state } = useContext(AppStore);
    const items = useMemo(() => Object.values(state.inventory), [state.inventory]);

    return (
        <div className="window inventory">
            <div className="content item-list">
                {items.map((item) => (
                    <div key={item.type}>
                        {item.type} ({item.quantity})
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InventoryViewer;
