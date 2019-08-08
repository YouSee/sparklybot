export const getTestOptions = () => {
  if (process.env.PXSCENE_PATH)
    return {
      sparkBrowserPath: process.env.PXSCENE_PATH,
    }
  return undefined
}
