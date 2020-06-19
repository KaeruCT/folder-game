import React, { useContext } from "react";
import "./InventoryViewer.scss";
import { AppStore } from "../../App";

function InventoryViewer() {
    const { state } = useContext(AppStore);
    return (
        <div className="window inventory">
            <div className="content item-list">
                {Object.values(state.inventory).map((item) => (
                    <div key={item.type}>{item.type} ({item.quantity})</div>
                ))}
            </div>
        </div>
    );
}

export default InventoryViewer;