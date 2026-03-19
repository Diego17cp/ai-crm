import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: `${BASE_URL}`,
    withCredentials: true,
})
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.code === "ECONNABORTED") console.error("A timeout happened on url: " + error.config.url);
        else if (error.response) console.error(`Error response: ${error.response.status} : ${error.response.data}`);
        else console.error("Error message: " + error.message);

        return Promise.reject(error);
    }
)
// more configurations if needed

export {
    apiClient,
}