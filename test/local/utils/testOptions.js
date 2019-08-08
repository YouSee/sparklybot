export const getTestOptions = () => {
  if (global.process.env.PXSCENE_PATH)
    return {
      sparkBrowserPath: global.process.env.PXSCENE_PATH,
    }
  return undefined
}
