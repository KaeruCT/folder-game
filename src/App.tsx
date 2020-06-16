import React, { useReducer, useState } from "react";
import "./App.scss";
import FilesystemViewer from "./component/file/FilesystemViewer";
import InventoryViewer from "./component/inventory/InventoryViewer";
import Navigation, { View } from "./component/navigation/Navigation";
import { reducer, Action, getInitialState, State } from "./reducer";

type Store = {
    state: State;
    dispatch: React.Dispatch<Action>;
}

export const AppStore = React.createContext({} as Store);

function App() {
    const [state, dispatch] = useReducer(reducer, getInitialState());

    const [view, setView] = useState(View.FILESYSTEM);

    return (
        <div className="app">
            {/* <pre>{prettyPrint(root)}</pre> */}
            <div className="view-container">
                <AppStore.Provider value={{ state, dispatch }}>
                    {view === View.FILESYSTEM && (
                        <FilesystemViewer />
                    )}
                    {view === View.INVENTORY && (
                        <InventoryViewer />
                    )}
                    {view === View.LOG && (
                        <div>log</div>
                    )}
                </AppStore.Provider>
            </div>
            <Navigation currentView={view} setView={setView} />
        </div>
    );
}

export default App;
