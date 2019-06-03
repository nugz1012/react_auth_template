import axios from 'axios';

// CONFIG
import { SERVER_API_BASE } from '../config/axios';

const instance = axios.create({
    withCredentials: true,
    baseURL: SERVER_API_BASE,
});

// REQUEST
instance.interceptors.request.use((req) => {
    return req;
});

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
    const { status } = err.response || {};       
    switch (status) {
        case 401:
            window.location='/logout';
        break
        default:
            console.log('File: axios.service.js', 'Line: 38', err.response)
    }
    return Promise.reject(err)
});

export default instance;
