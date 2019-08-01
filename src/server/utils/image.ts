export const decodeBase64Image = (dataString: string) => {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

  if (matches.length !== 3) {
    throw new Error('Invalid input string')
  }

  return {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64'),
  }
}
