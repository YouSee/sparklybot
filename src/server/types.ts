export interface TestOptions {
  testRegexPath: string,
  isRemoteTesting?: boolean,
  sparkBrowserPath?: string,
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
  GET_MEMORY_USAGE = 6,
}

export interface MessagePayload {
  timeoutSeconds?: number,
  action: SparkBrowserActions,
  payload?: any,
}

