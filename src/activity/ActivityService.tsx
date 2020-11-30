import {ActivityInterface} from "./ActivityInterface";
import axios from 'axios';
import {Client} from '@stomp/stompjs';
import {authConfig} from "../core";

const beApi = 'http://localhost:8080/api/activity';

export const getActivities: (token: string, page: number) => Promise<ActivityInterface[]> = (token, page) => {
    console.log(token);
    return axios
        .get(`${beApi}` + `?page=${page}&size=15`, authConfig(token))
        .then(res => {
            console.log(res);
            return Promise.resolve(res.data.content);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}


export const createActivity: (token: string, activity: ActivityInterface) => Promise<ActivityInterface[]> = (token, activity) => {
    return axios.post(`${beApi}`, activity, authConfig(token))
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

export const updateActivity: (token: string, activity: ActivityInterface) => Promise<ActivityInterface[]> = (token, activity) => {
    return axios.put(`${beApi}/${activity.id}`, activity, authConfig(token))
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}

interface MessageData {
    body: {
        event: string;
        payload: ActivityInterface;
    }
}


export const newWebSocket = (onMessage: (data: MessageData) => void) => {

    const ws = new Client({
        brokerURL: `ws://localhost:8080/ws`,
        debug: function (str) {
            console.log(str);
        },
    });
    ws.onConnect = () => {
        console.log('web socket connect');
        ws.subscribe("/topic/activity", (re) => {
            return onMessage(JSON.parse(re.body));
        });

    };
    ws.onDisconnect = () => {
        console.log('web socket disconnect');
    };
    ws.onStompError = error => {
        console.log('web socket stomp error', error);
    };
    ws.onUnhandledMessage = messageEvent => {
        console.log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.body));
    };
    ws.activate();
    return () => {
        ws.deactivate();
    }
}
