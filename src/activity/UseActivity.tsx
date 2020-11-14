import {ActivityInterface} from "./ActivityInterface";
import {useEffect, useReducer} from "react";
import {getActivities} from "./ActivityService";

export interface ActivityState {
    activities?: ActivityInterface[],
    fetching: boolean,
    fetchingError?: Error,
}

export interface ActivityProps extends ActivityState {
    addActivity: () => void,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ActivityState = {
    activities: undefined,
    fetching: false,
    fetchingError: undefined,
};

const FETCH_ACTIVITY_STARTED = 'FETCH_ACTIVITY_STARTED';
const FETCH_ACTIVITY_SUCCEEDED = 'FETCH_ACTIVITY_SUCCEEDED';
const FETCH_ACTIVITY_FAILED = 'FETCH_ACTIVITY_FAILED';

const reducer: (state: ActivityState, action: ActionProps) => ActivityState =
    (state, { type, payload }) => {
        switch(type) {
            case FETCH_ACTIVITY_STARTED:
                return { ...state, fetching: true };
            case FETCH_ACTIVITY_SUCCEEDED:
                return { ...state, activities: payload.items, fetching: false };
            case FETCH_ACTIVITY_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            default:
                return state;
        }
    };

export const useActivity: () => ActivityProps = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { activities, fetching, fetchingError } = state;
    const addActivity = () => {
        console.log('addItem - TODO');
    };
    useEffect(getActivitiesEffect, []);
    return {
        activities,
        fetching,
        fetchingError,
        addActivity,
    };

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
};
