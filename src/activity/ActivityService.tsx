import {ActivityInterface} from "./ActivityInterface";
import axios from 'axios';
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
