import {ActivityInterface} from "./ActivityInterface";
import axios from 'axios';
import {Client} from '@stomp/stompjs';

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
        ws.subscribe("/topic/news", (re) => {
            console.log("in new web socket " +  JSON.parse(re.body).event);
            console.log(onMessage(JSON.parse(re.body)));
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
