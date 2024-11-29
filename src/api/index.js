import axios from "axios";
import { baseURL } from "./url";

export const api = axios.create({
    baseURL: baseURL
})

export const setHeadersLink = (token, apikey) => {
    api.defaults.headers.Authorization = `Bearer ${token}`
    api.defaults.headers.apikey = apikey
}

export const remoteHeadersToken = () => {
    api.defaults.headers.Authorization = null
    api.defaults.headers.apikey = null
}