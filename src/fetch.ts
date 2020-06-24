import ConfigurationError from './configuration-error';

const fetch = require('make-fetch-happen');

export class Fetcher {
  private auth: string;

  private cacheDir?: string;

  constructor(auth: string, cacheDir?: string) {
    this.auth = auth;
    this.cacheDir = cacheDir;
  }

  public async doRequest<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      cacheManager: this.cacheDir,
      headers: {
        Authorization: `token ${this.auth}`,
      },
    });
    const parsedResponse = await res.json();
    if (res.ok) {
      return parsedResponse;
    }
    throw new ConfigurationError(
      `Fetch error: ${res.statusText}.\n${JSON.stringify(parsedResponse)}`,
    );
  }
}
