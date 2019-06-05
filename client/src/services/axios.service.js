import axios from 'axios';

// CONFIG
import { SERVER_API_BASE } from '../config/axios';

const instance = axios.create({
    withCredentials: true,
    baseURL: SERVER_API_BASE,
});

let isTokenRefreshing = false;
let subscribers = []

function onTokenRefreshed(token) {
    subscribers = subscribers.filter(callback => callback(token));
}

function addSubscriber(callback) {
    subscribers.push(callback)
}

// RESPONSE - Check the response
instance.interceptors.response.use((res) => {
    const { token: tokenFromBody } = res.data;
    const { token: tokenFromHeader } = res.headers;
    if (tokenFromBody || tokenFromHeader) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${tokenFromBody || tokenFromHeader}`;
    }
    return res;
});

// RESPONSE - Check the error
instance.interceptors.response.use(null, (err = {}) => {
    // const { config, response: { status } } = err;
    const { config, response: { status } } = err || {};
    const originalRequest = config;
    
    if (status === 401 && config.url.indexOf('token') < 0) {
        if (!isTokenRefreshing) {
            isTokenRefreshing = true;

            // Refresh token
            axios.get('/token', {
                withCredentials: true,
                baseURL: SERVER_API_BASE,
            }).then((res) => {
                const { token } = res.data;
                isTokenRefreshing = false;
                instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                onTokenRefreshed(token);
            }).catch((err) => {
                // console.log('File: axios.service.js', 'Line: 52', err.response)
            });
        }

        const retryOriginalRequest = new Promise((resolve) => {
            addSubscriber(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axios(originalRequest));
            });
        });

        return retryOriginalRequest;

    } else if (status === 401) {
        // window.location='/logout';
    }
    return Promise.reject(err)
});

export default instance;
