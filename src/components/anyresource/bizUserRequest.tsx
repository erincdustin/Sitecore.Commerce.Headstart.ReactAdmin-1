import Axios, {AxiosRequestConfig, AxiosResponse, AxiosError} from "axios"
// import AxiosTiming from "axios-timing"
import jwtDecode from "jwt-decode"
import paramsSerializer from "./ParamsSerializer"
let axios

interface KeyValuePair {
  key: string
  value: string
}

interface RequestForm {
  body: FieldValues
  params: FieldValues
  locked: FieldValues // Not part of the request. Only route params can be locked.
}

export interface FieldValues {
  [fieldName: string]: any
}

const isRouteParam = (operation, paramName) => {
  return (
    operation.parameters &&
    operation.parameters
      .filter((param) => {
        return param.in === "path"
      })
      .map((param) => param.name)
      .includes(paramName)
  )
}

const isQueryParam = (operation, paramName) => !isRouteParam(operation, paramName)

const makeQueryString = (params: FieldValues) => {
  return `${Object.entries(params)
    .filter(([key, val]: [string, any]) => {
      return typeof val === "object" ? Boolean(val.length) : Boolean(val)
    })
    .map(([key, val]: [string, any]) => {
      /**
       * TODO: Figure out a more dynamic way of checking the openapi spec for
       * identifying how to parse object values into the query string. Right now
       * we know that searchOn & sortBy are supposed have 1 key - but there could
       * be others (right now, or in the future)
       */
      if (key === "filters") {
        return val
          .filter((keyValuePair: KeyValuePair) => {
            return keyValuePair.key && keyValuePair.value
          })
          .map((keyValuePair: KeyValuePair) => `${keyValuePair.key}=${encodeURIComponent(keyValuePair.value)}`)
          .join("&")
      } else {
        if (typeof val === "object" && (key === "searchOn" || key === "sortBy")) {
          return `${key}=${val.map(encodeURIComponent).join(",")}`
        } else if (typeof val === "object") {
          return val
            .map((v) => {
              return `${key}=${encodeURIComponent(v)}`
            })
            .join("&")
        } else {
          return `${key}=${encodeURIComponent(val)}`
        }
      }
    })
    .join("&")}`
}

export interface AxiosResponseWithOperation extends AxiosResponse {
  operation: any
}

export default class BizUserRequest {
  public token: string
  public id: string
  // public tab: ConsoleTab;
  public form: RequestForm
  public operation: any //TODO: need an operation interface
  public duration: number
  private _response?: AxiosResponse
  constructor(token: string, form: RequestForm, operation: any) {
    this.token = token
    this.id = Date.now().toString()
    // this.tab = tab;
    this.form = form
    this.operation = operation
    this.duration = 0
  }

  get response() {
    return this._response
  }

  get routingUrl(): string {
    let url = this.operation.path
    const params = this.form.params
    if (url.indexOf("{") > -1) {
      Object.entries(params)
        .filter(([key, value]: [string, any]) => {
          return isRouteParam(this.operation, key)
        })
        .forEach(([key, value]: [string, any]) => {
          if (Boolean(value)) {
            url = url.replace(`{${key}}`, value)
          }
        })
      return url
    }
    return url
  }

  get path(): string {
    const queryString = makeQueryString(this.params)
    return this.routingUrl + (Boolean(queryString) ? `?${queryString}` : "")
  }

  get params(): FieldValues {
    const params = {}
    Object.entries(this.form.params).forEach(([key, value]: [string, any]) => {
      if (isQueryParam(this.operation, key) && value) {
        params[key] = value
      }
    })

    return params
  }

  get axiosRequest(): AxiosRequestConfig {
    const token = this.token
    let decoded
    if (token) {
      decoded = jwtDecode(token)
    }
    return {
      method: this.operation.verb.toLocaleLowerCase(),
      baseURL: decoded ? decoded.iss + "/v1" : undefined,
      url: this.routingUrl,
      headers: {Authorization: `Bearer ${this.token}`},
      params: this.params,
      data: this.form.body,
      paramsSerializer
    }
  }

  public send = async (): Promise<AxiosResponseWithOperation> => {
    if (!axios) {
      axios = Axios.create()
      // AxiosTiming(axios, (timeInMs: number) => {
      //   this.duration = Math.round(timeInMs)
      // })
    }
    return axios.request(this.axiosRequest)
    // .then((response: AxiosResponseWithOperation) => {
    //   debugger;
    //   const r = response;
    //   r.operation = this.operation;
    //   this._response = response;
    // })
    // .catch((err: AxiosError) => {
    //   console.error('Console Request Failed', err);
    //   this._response = err.response;
    // });
  }
}
