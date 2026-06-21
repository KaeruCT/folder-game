import { createContext, useCallback, useReducer, useState } from "react";
import "./App.scss";
import FilesystemViewer from "./component/file/FilesystemViewer";
import InventoryViewer from "./component/inventory/InventoryViewer";
import Navigation, { View } from "./component/navigation/Navigation";
import { type Action, getInitialState, reducer, type State } from "./reducer";

type Store = {
    state: State;
    dispatch: React.Dispatch<Action>;
};

export const AppStore = createContext({} as Store);

function App() {
    const memoizedReducer = useCallback(reducer, []);
    const [state, dispatch] = useReducer(memoizedReducer, getInitialState());
    const [view, setView] = useState(View.FILESYSTEM);

    return (
        <div className="app">
            <div className="view-container">
                <AppStore.Provider value={{ state, dispatch }}>
                    {view === View.FILESYSTEM && <FilesystemViewer />}
                    {view === View.INVENTORY && <InventoryViewer />}
                    {view === View.LOG && <div>WIP</div>}
                </AppStore.Provider>
            </div>
            <Navigation currentView={view} setView={setView} />
        </div>
    );
}

export default App;
