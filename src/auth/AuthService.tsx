import axios from 'axios';
const authUrl = `http://localhost:8080/api/auth/signin`;

export interface AuthProps {
  token: string;
  userId: number;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  return axios.post(authUrl, { username, password })
      .then(res => {
        return Promise.resolve(res.data);
      })
      .catch(err => {
        return Promise.reject(err);
      });;
}
