import React, {useCallback, useEffect, useReducer} from "react";
import {ActivityInterface} from "./ActivityInterface";
import {createActivity, getActivities, updateActivity} from "./ActivityService";
import PropTypes from 'prop-types';

type SaveActivityFn = (activity: ActivityInterface) => Promise<any>;

export interface ActivityState {
    activities?: ActivityInterface[];
    fetching: boolean;
    fetchingError?: Error | null;
    saving: boolean;
    savingError?: Error | null;
    saveActivity?: SaveActivityFn;
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

const reducer: (state: ActivityState, action: ActionProps) => ActivityState =
    (state, { type, payload }) => {
        switch(type) {
            case FETCH_ACTIVITY_STARTED:
                return { ...state, fetching: true };
            case FETCH_ACTIVITY_SUCCEEDED:
                return { ...state, activities: payload.items, fetching: false };
            case FETCH_ACTIVITY_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ACTIVITY_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ACTIVITY_SUCCEEDED:
                const activities = [...(state.activities || [])];
                const activity = payload.item;
                const index = activities.findIndex(ac => ac.id === activity.id);
                if (index === -1) {
                    activities.splice(0, 0, activity);
                } else {
                    activities[index] = activity;
                }
                return { ...state,  activities, saving: false };
            case SAVE_ACTIVITY_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
};

export const ActivityContext = React.createContext<ActivityState>(initialState);

export const ActivityProvider: React.FC<ActivityProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { activities, fetching, fetchingError, saving, savingError } = state;
    useEffect(getActivitiesEffect, []);
    const saveActivity = useCallback<SaveActivityFn>(saveActivityCallback, []);
    const value = { activities, fetching, fetchingError, saving, savingError, saveActivity};

    return (
        <ActivityContext.Provider value={value}>
            {children}
        </ActivityContext.Provider>
    );

    function getActivitiesEffect() {
        let canceled = false;
        fetchActivities();
        return () => {
            canceled = true;
        }

        async function fetchActivities() {
            try {
                dispatch({ type: FETCH_ACTIVITY_STARTED });
                const items = await getActivities();
                if (!canceled) {
                    dispatch({ type: FETCH_ACTIVITY_SUCCEEDED, payload: { items } });
                }
            } catch (error) {
                dispatch({ type: FETCH_ACTIVITY_FAILED, payload: { error } });
            }
        }
    }

    async function saveActivityCallback(activity: ActivityInterface) {
        try {
            dispatch({ type: SAVE_ACTIVITY_STARTED });
            const savedItem = await (activity.id ? updateActivity(activity) : createActivity(activity));
            dispatch({ type: SAVE_ACTIVITY_SUCCEEDED, payload: { item: savedItem } });
        } catch (error) {
            dispatch({ type: SAVE_ACTIVITY_FAILED, payload: { error } });
        }
    }
}