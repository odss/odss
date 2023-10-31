import { Config } from "./types";

const DEFAULT = {
  bundles: [],
}

export interface IStorage {
  load<T>(name: string): Promise<T>;
  save<T>(name: string, payload: T): Promise<void>;
  remove(name: string): Promise<void>;

}

export class RemoteStorage implements IStorage {
  constructor(
    private url = `http://${location.host}/-/storage`
  ) {
  }
  async load<Response>(name: string): Promise<Response> {
    return this.request<null, Response>('read', name);
  }
  async save<Payload>(name: string, payload: Payload): Promise<void> {
    return this.request<Payload>('write', name, payload);
  }
  async remove(name: string): Promise<void> {
    return this.request<null, void>('remove', name);
  }
  async request<P, Response = void>(action: string, name: string, payload: any = null): Promise<Response> {
    const res = await fetch(this.url, {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        name,
        payload,
      })
    });
    return res.json() as Response;
  }
}

export class LocalStorage implements IStorage {
  constructor(private prefix: string) {}

  async load<Response>(name: string): Promise<Response> {
    const key = `${this.prefix}${name}`;
    const payload = localStorage.getItem(key);
    if (payload) {
        try {
            return JSON.parse(payload) || {};
        } catch(err) {
            console.log(err);
        }
    }
    return '' as Response;
  }
  async save<Payload>(name: string, payload: Payload): Promise<void> {
    const key = `${this.prefix}${name}`;
    const data = JSON.stringify(payload);
    localStorage.setItem(key, data);
  }
  async remove(name: string): Promise<void> {
    const key = `${this.prefix}${name}`;
    localStorage.removeItem(key);
  }
}
