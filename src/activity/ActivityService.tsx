import {ActivityInterface} from "./ActivityInterface";
import axios from 'axios';
import SockJS from 'sockjs-client';
const beApi = 'http://localhost:8080/api/activity';

export const getActivities: () => Promise<ActivityInterface[]> = () => {
    return axios
        .get<ActivityInterface[]>(`${beApi}/all`)
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}


export const createActivity: (activity: ActivityInterface) => Promise<ActivityInterface[]> = activity => {
    return axios.post(`${beApi}/test`, activity)
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

export const updateActivity: (activity: ActivityInterface) => Promise<ActivityInterface[]> = activity => {
    return axios.put(`${beApi}/${activity.id}`, activity)
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

interface MessageData {
    event: string;
    payload: {
        activity: ActivityInterface;
    };
}


export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new SockJS(`http://localhost:8080/ws/topic/news`, null, {})

    ws.onopen = () => {
        console.log('web socket onopen');
    };
    ws.onclose = () => {
        console.log('web socket onclose');
    };
    ws.onerror = error => {
        console.log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        console.log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
