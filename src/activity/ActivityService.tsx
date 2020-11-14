import {ActivityInterface} from "./ActivityInterface";
import axios from 'axios';
const beApi = 'http://localhost:8080/api';

export const getActivities: () => Promise<ActivityInterface[]> = () => {
    return axios
        .get<ActivityInterface[]>(`${beApi}/activity/all`)
        .then(res => {
            return Promise.resolve(res.data);
        })
        .catch(err => {
            return Promise.reject(err);
        });
}
