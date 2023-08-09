import axios from 'axios';

const emailApi = axios.create({
    baseURL: '/api'
});

export default emailApi;
