import React, { useReducer } from "react";
import "./App.scss";
import FilesystemViewer from "./component/file/FilesystemViewer";
import { reducer, Action, getInitialState } from "./reducer";

export const AppDispatch = React.createContext<React.Dispatch<Action>>(() => { });

function App() {
    const [state, dispatch] = useReducer(reducer, getInitialState());
    return (
        <div className="app">
            {/* <pre>{prettyPrint(root)}</pre> */}
            <AppDispatch.Provider value={dispatch}>
                <FilesystemViewer root={state.filesystemRoot} />
            </AppDispatch.Provider>
        </div>
    );
}

export default App;
