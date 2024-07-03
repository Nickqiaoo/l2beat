import fetch, { RequestInit, Response } from 'node-fetch'
import {HttpsProxyAgent} from 'https-proxy-agent';

export class HttpClient {
  private readonly agent!: HttpsProxyAgent<string>;
  constructor(private readonly defaultTimeoutMs = 10_000) {
    this.agent = new HttpsProxyAgent("http://localhost:7890");
  }

  fetch(url: string, init?: RequestInit): Promise<Response> {
    const requestInit: RequestInit = {
      ...init,
      // 设置代理代理（如果存在）
      //agent: this.agent ?? init?.agent,
      // 设置超时时间
      timeout: (init && 'timeout' in init ? init.timeout : this.defaultTimeoutMs),
    };

    return fetch(url, requestInit);
  }
}
