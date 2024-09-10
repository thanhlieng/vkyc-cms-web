import React, { useReducer } from 'react';
import { appReducer } from './reducers/App.Reducer';
import { IAction, InitialStateType } from './types';

interface ContextType {
    state: InitialStateType;
    dispatch: (action: IAction) => void;
}

export const Store = React.createContext<ContextType | undefined>(undefined);

// initial state
const initialState: InitialStateType = {
    appLoading: true,
    syncLoading: false,
    info: { id: 1, name: 'Agency 1', key: 'Agency1' },
    kiotviets: null,
    socket: null,
    appBackground: {
        show: false,
        showFlower: false,
    },
    callbackNoti: false,
    callbackKioviet: false,
    openModalChangePassword: false,
};

export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, { ...initialState });

    Store.displayName = 'StoreContext';

    return <Store.Provider value={{ state, dispatch }}>{children}</Store.Provider>;
};
