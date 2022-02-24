const CorsAnyWhere = 'https://cors-anywhere.herokuapp.com/'
interface EnvyOptions {
  name: string
  server?: boolean
}
export const envy = (options: EnvyOptions) => {
  const { name, server } = options
  return (server && server === true)
    ? import.meta.env[name]
    : import.meta.env[`VITE_${name}`]
};

export const cacheConfig = {
  max: 1000, // max size
  maxAge: 10 * 60 * 1000, // max age in ms (i.e. 10 minutes)
}
export const parseUrl = (url?: string) => {
  return url ? new URL(url) : new URL(window.location.href);
}
export interface buildHeaderOptions {
  url: string | undefined,
  content?: string,
  cors?: boolean
}
export interface buildHeaderResult {
  "Access-Control-Allow-Origin": string
  "Content-Type": string
  "Accept": string
  "mode": string
  "Access-Control-Allow-Credentials": string
}
export const buildHeaders = (options: buildHeaderOptions): buildHeaderResult => {
  const { url, content, cors } = options;
  return {
    "Access-Control-Allow-Origin": url && url.startsWith('http') ? parseUrl(url).origin : url ? "*" : "*",
    "Content-Type": content || "*/*",
    "Accept": content || "*/*",
    "mode": cors ? "cors" : "no-cors",
    "Access-Control-Allow-Credentials": cors ? "true" : "false",

  }
};
export const corUrl = (url: string) => `${CorsAnyWhere}${url}`
export interface fetchConfigOptions {
  url: string,
  method: string,
  cors?: boolean,
  content?: string,
}
interface fetchConfigResult {
  url: string,
  method: string,
  withCredentials: boolean,
  responseType: string,
  headers: buildHeaderResult,
}
export const fetchConfig = (options: fetchConfigOptions): fetchConfigResult => {
  const { url, method, cors, content } = options;
  return {
    method: method && 'GET',
    url: !cors ? url : corUrl(url),
    withCredentials: false,
    responseType: 'stream',
    headers: content ? buildHeaders({ url, content, cors }) : buildHeaders({ url, cors }),
  }
}
export const currencyLayer = {
  list: () => {
    return `/data_layer/list?access_key=${envy({ name: 'CURRENCY_LAYER_KEY' })}`;
  },
  convert: function (from: string, to: string, amount: number) {
    return `/data_layer/convert?from=${from}&to=${to}&amount=${amount}&access_key=${envy({ name: 'CURRENCY_LAYER_KEY' })}`;
  },
};