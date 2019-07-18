export interface TestOptions {
  sparkApplicationPath: string,
  testRegexPath: string,
  port?: number,
  wsPort?: number,
  hostname?: string,
}

export enum SparkBrowserActions {
  REFRESH_BROWSER = 0,
  CLOSE_BROWSER = 1,
  TAKE_SCREENSHOT = 2,
  PRINT_SCENE_STRUCTURE = 3,
  KEYSTROKE = 4,
}

export interface MessagePayload {
  action: SparkBrowserActions,
  payload?: string,
}

