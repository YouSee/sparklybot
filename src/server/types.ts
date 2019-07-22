export interface TestOptions {
  testRegexPath: string,
  port?: number,
  wsPort?: number,
  hostname?: string,
}

export enum SparkBrowserActions {
  REFRESH_BROWSER = 1,
  CLOSE_BROWSER = 2,
  TAKE_SCREENSHOT = 3,
  PRINT_SCENE_STRUCTURE = 4,
  KEYSTROKE = 5,
}

export interface MessagePayload {
  timeoutSeconds?: number,
  action: SparkBrowserActions,
  payload?: string,
}

