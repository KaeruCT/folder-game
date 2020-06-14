import React from "react";
import "./InventoryViewer.scss";
import { Inventory } from "../../model/inventory";

interface Props {
    inventory: Inventory;
}

function InventoryViewer({ inventory }: Props) {
    return (
        <div className="inventory">
            <div className="item-list">
                {Object.values(inventory).map((item) => (
                    <div>{item.type} ({item.quantity})</div>
                ))}
            </div>
        </div>
    );
}

export default InventoryViewer;