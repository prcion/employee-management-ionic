import React, {useCallback, useContext, useEffect, useReducer, useState} from "react";
import {ActivityInterface} from "./ActivityInterface";
import {createActivity, getActivities, newWebSocket, updateActivity} from "./ActivityService";
import PropTypes from 'prop-types';
import {AuthContext, LogoutFn} from "../auth";
import {Plugins} from "@capacitor/core";
import {useNetwork} from "../network/useNetwork";

type SaveActivityFn = (activity: ActivityInterface) => Promise<any>;
export type incrementPage = (filter: string | undefined | null, isInfiniteScrool: boolean) => void;
export interface ActivityState {
    activities?: ActivityInterface[];
    fetching: boolean;
    fetchingError?: Error | null;
    saving: boolean;
    savingError?: Error | null;
    saveActivity?: SaveActivityFn;
    logout?: LogoutFn;
    incrementPage?: incrementPage;
    disableInfiniteScroll?: boolean;
}

export interface ActivityProps extends ActivityState {
    addActivity: () => void;
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: ActivityState = {
    fetching: false,
    saving: false,
};

interface ActivityProviderProps {
    children: PropTypes.ReactNodeLike;
}

const FETCH_ACTIVITY_STARTED = 'FETCH_ACTIVITY_STARTED';
const FETCH_ACTIVITY_SUCCEEDED = 'FETCH_ACTIVITY_SUCCEEDED';
const FETCH_ACTIVITY_FAILED = 'FETCH_ACTIVITY_FAILED';
const SAVE_ACTIVITY_STARTED = 'SAVE_ACTIVITY_STARTED';
const SAVE_ACTIVITY_SUCCEEDED = 'SAVE_ACTIVITY_SUCCEEDED';
const SAVE_ACTIVITY_FAILED = 'SAVE_ACTIVITY_FAILED';
const FETCH_ACTIVITY_SUCCEEDED_WITHOUT_FILTER = "FETCH_ACTIVITY_SUCCEEDED_WITHOUT_FILTER";

const reducer: (state: ActivityState, action: ActionProps) => ActivityState =
    (state, { type, payload }) => {
        const { Storage } = Plugins;
        switch(type) {
            case FETCH_ACTIVITY_STARTED:
                return { ...state, fetching: true };
            case FETCH_ACTIVITY_SUCCEEDED_WITHOUT_FILTER:
                Storage.remove({ key: 'activities' });
                Storage.set({
                    key: 'activities',
                    value: JSON.stringify(payload.items)
                });
                console.log([...(state.activities || []), ...payload.items]);
                return { ...state, activities: [...(state.activities || []), ...payload.items], fetching: false };
            case FETCH_ACTIVITY_SUCCEEDED:
                console.log("with filets");
                Storage.remove({ key: 'activities' });
                Storage.set({
                    key: 'activities',
                    value: JSON.stringify(payload.items)
                });
                return { ...state, activities: payload.items, fetching: false };
            case FETCH_ACTIVITY_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ACTIVITY_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ACTIVITY_SUCCEEDED:
                Storage.remove({ key: 'activities' });
                const activities = [...(state.activities || [])];
                let activity = payload.item;
                if (activity == undefined) {
                    activity = payload.payload;
                }
                const index = activities.findIndex(ac => ac.id === activity.id);
                if (index === -1) {
                    activities.splice(0, 0, activity);
                } else {
                    activities[index] = activity;
                }

                Storage.set({
                    key: 'activities',
                    value: JSON.stringify(activities)
                });
                return { ...state,  activities, saving: false };
            case SAVE_ACTIVITY_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
};

export const ActivityContext = React.createContext<ActivityState>(initialState);

export const ActivityProvider: React.FC<ActivityProviderProps> = ({children}) => {
    const { logout, token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { activities, fetching, fetchingError, saving, savingError } = state;
    let [page, incremPage] = useState(0);
    const incrementPage = useCallback<incrementPage>(incrementPageCallback, []);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    let [filterActivity, changeFilterActivity] = useState<string>("");
    let [isInfiniteScroll, changeIsInfiniteScroll] = useState(false);
    useEffect(getActivitiesEffect, [token, page, filterActivity]);
    useEffect(wsEffect, []);
    const saveActivity = useCallback<SaveActivityFn>(saveActivityCallback, [token]);
    const value = { disableInfiniteScroll, incrementPage, logout, activities, fetching, fetchingError, saving, savingError, saveActivity};

    const { Storage } = Plugins;
    return (
        <ActivityContext.Provider value={value}>
            {children}
        </ActivityContext.Provider>
    );

    function incrementPageCallback(filter: string | undefined | null, isInfiniteScrool: boolean): void {

        if (filter != undefined) {
            incremPage( 0);
            changeIsInfiniteScroll(false);
            changeFilterActivity(filter);
        }
        if (isInfiniteScrool) {
            changeIsInfiniteScroll(true);
            incremPage(page++);
        }
    }

    function getActivitiesEffect() {
        console.log("page" + page);
        let canceled = false;
        // if (!networkStatus.connected) {
        //     console.log("true");
        //     return () => {
        //         canceled = true;
        //     }
        // }

        fetchActivities();

        return () => {
            canceled = true;
        }

        async function fetchActivities() {
            if (!token?.trim()) {
                return;
            }
            try {
                dispatch({ type: FETCH_ACTIVITY_STARTED });
                console.log("Filter activity: " + filterActivity);
                const items = await getActivities(token, page, filterActivity);
                if (items) {
                    if (!canceled) {
                        console.log("fetch items: " + filterActivity);
                        if (!isInfiniteScroll) {
                            dispatch({type: FETCH_ACTIVITY_SUCCEEDED, payload: {items}});
                        } else {
                            dispatch({type: FETCH_ACTIVITY_SUCCEEDED_WITHOUT_FILTER, payload: {items}});
                        }
                    }
                    setDisableInfiniteScroll(items.length < 10);
                } else {
                    setDisableInfiniteScroll(true);
                }
            } catch (error) {
                dispatch({ type: FETCH_ACTIVITY_FAILED, payload: { error } });
            }
        }
    }

    async function saveActivityCallback(activity: ActivityInterface) {
        try {
            dispatch({ type: SAVE_ACTIVITY_STARTED });
            const savedItem = await (activity.id ? updateActivity(token, activity) : createActivity(token, activity));
            dispatch({ type: SAVE_ACTIVITY_SUCCEEDED, payload: { item: savedItem } });
        } catch (error) {
            dispatch({ type: SAVE_ACTIVITY_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        let userId: number;
        const closeWebSocket = newWebSocket((message) => {
            if (canceled) {
                return;
            }
            const res = Storage.get({ key: 'userId' });
            res.then(r => {
                if(r.value != null) {
                    userId = parseInt(r.value);
                }
            });
            const {event, payload} = message.body;
            console.log("user from storage: " + userId);
            console.log("user from be: "+payload.userId);
            if (userId != null && userId === payload.userId) {
                if (event === 'created' || event === 'updated') {
                    console.log("ab");
                    dispatch({type: SAVE_ACTIVITY_SUCCEEDED, payload: {payload}});
                }
            }
        });
        return () => {
            canceled = true;
            closeWebSocket();
        }
    }
}
