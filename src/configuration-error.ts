export default class ConfigurationError {
  public name = 'ConfigurationError';

  public message: string;

  constructor(message: string) {
    Error.apply(this);
    this.message = message;
  }
}
