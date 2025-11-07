import axios from "axios";


const axiosInstance=axios.create({
    baseURL:process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials:true
})

let isRefreshing=false;

let refreshSubsribers: Array<() => void> = [];

const handleLogout=()=>{
    if(window.location.pathname!=="login"){
        window.location.href="/login"
    }
}

const subsribeTokenRefresh=(callback:()=>void)=>{
    refreshSubsribers.push(callback)
}

const onRefreshSuccess=()=>{
    refreshSubsribers.forEach((callback)=>callback())
    refreshSubsribers=[]
}

axiosInstance.interceptors.request.use(
    (config)=>config,
    (error)=>Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response)=>response,
    async(error)=>{
        const originalRequest=error.config;

        //prevent infinite problem retry effect
        if(error.response?.status==401 && !originalRequest._retry){
            if(isRefreshing){
                return new Promise((resolve)=>{
                    subsribeTokenRefresh(()=>resolve(axiosInstance(originalRequest)))
                })
            }
            originalRequest._retry=true;
            isRefreshing=true;
            try{
                axios.post(process.env.NEXT_PUBLIC_SERVER_URL+'/api/refresh-token',{},{withCredentials:true})
                isRefreshing=false;
                onRefreshSuccess();
                return axiosInstance(originalRequest)
            }catch(error){
                isRefreshing=false;
                refreshSubsribers=[]
                handleLogout()
                return Promise.reject(error)
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance