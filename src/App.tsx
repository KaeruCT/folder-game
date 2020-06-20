import React, { useReducer, useState, useCallback } from "react";
import "./App.scss";
import FilesystemViewer from "./component/file/FilesystemViewer";
import InventoryViewer from "./component/inventory/InventoryViewer";
import Navigation, { View } from "./component/navigation/Navigation";
import { reducer, Action, getInitialState, State } from "./reducer";
import { prettyPrint } from "./model/files";

type Store = {
    state: State;
    dispatch: React.Dispatch<Action>;
}

export const AppStore = React.createContext({} as Store);

function App() {
    const memoizedReducer = useCallback(reducer, []);
    const [state, dispatch] = useReducer(memoizedReducer, getInitialState());
    const [view, setView] = useState(View.FILESYSTEM);

    return (
        <div className="app">
            <div className="view-container">
                <AppStore.Provider value={{ state, dispatch }}>
                    {view === View.FILESYSTEM && (
                        <FilesystemViewer />
                    )}
                    {view === View.INVENTORY && (
                        <InventoryViewer />
                    )}
                    {view === View.LOG && (
                        <div>
                            <pre>{prettyPrint(state.filesystemRoot)}</pre>
                        </div>
                    )}
                </AppStore.Provider>
            </div>
            <Navigation currentView={view} setView={setView} />
        </div>
    );
}

export default App;
