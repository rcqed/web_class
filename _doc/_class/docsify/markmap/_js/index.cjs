'use strict';

const testPath = "npm2url/dist/index.cjs";
const defaultProviders = {
  jsdelivr: (path) => `https://cdn.jsdelivr.net/npm/${path}`,
  unpkg: (path) => `https://unpkg.com/${path}`
};
class UrlBuilder {
  constructor() {
    this.providers = { ...defaultProviders };
    this.provider = "jsdelivr";
  }
  getFastestProvider(timeout = 5e3, path = testPath) {
    return new Promise((resolve, reject) => {
      Promise.all(
        Object.entries(this.providers).map(async ([name, factory]) => {
          try {
            const res = await fetch(factory(path));
            if (!res.ok) {
              throw res;
            }
            await res.text();
            resolve(name);
          } catch {
          }
        })
      ).then(() => reject(new Error("All providers failed")));
      setTimeout(reject, timeout, new Error("Timed out"));
    });
  }
  async findFastestProvider(timeout) {
    this.provider = await this.getFastestProvider(timeout);
    return this.provider;
  }
  setProvider(name, factory) {
    if (factory) {
      this.providers[name] = factory;
    } else {
      delete this.providers[name];
    }
  }
  getFullUrl(path, provider = this.provider) {
    if (path.includes("://")) {
      return path;
    }
    const factory = this.providers[provider];
    if (!factory) {
      throw new Error(`Provider ${provider} not found`);
    }
    return factory(path);
  }
}
const urlBuilder = new UrlBuilder();

exports.UrlBuilder = UrlBuilder;
exports.urlBuilder = urlBuilder;
