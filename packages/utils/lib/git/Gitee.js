import axios from "axios"
import { GitServer } from "./GitServer.js"

const BASE_URL = 'https://gitee.com/api/v5'

class Gitee extends GitServer {
  constructor() {
    super()
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
    })

    this.service.interceptors.response.use(response => {
      return response.data
    }, error => {
      return Promise.reject(error)
    })

  }
  get(url, params, headers) {
    console.log(url, params)
    return this.service({
      url,
      method: 'get',
      params: {
        ...params,
        access_token: this.token
      },
      headers
    })
  }

  post() {
    
  }

  searchRepositories(params) {
    return this.get('search/repositories', params)
  }
}

export default Gitee