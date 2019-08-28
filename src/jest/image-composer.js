const getMaxImageSize = images => {
  let maxWidth = 0
  let maxHeight = 0

  images.forEach(image => {
    if (image.imageWidth > maxWidth) {
      maxWidth = image.imageWidth
    }

    if (image.imageHeight > maxHeight) {
      maxHeight = image.imageHeight
    }
  })

  return {
    maxWidth,
    maxHeight,
  }
}

const ImageComposer = function ImageComposer(options = {}) {
  this.direction = options.direction || 'horizontal'
  this.images = []

  return this
}

ImageComposer.prototype.addImage = function addImage(
  imageData,
  imageWidth,
  imageHeight,
) {
  this.images.push({
    imageData,
    imageWidth,
    imageHeight,
  })

  return this
}

ImageComposer.prototype.getParams = function getParams() {
  const { maxWidth, maxHeight } = getMaxImageSize(this.images)

  const compositeWidth =
    maxWidth * (this.direction === 'horizontal' ? this.images.length : 1)
  const compositeHeight =
    maxHeight * (this.direction === 'vertical' ? this.images.length : 1)
  const offsetX = this.direction === 'horizontal' ? maxWidth : 0
  const offsetY = this.direction === 'vertical' ? maxHeight : 0

  return {
    direction: this.direction,
    images: this.images,
    imagesCount: this.images.length,
    compositeWidth,
    compositeHeight,
    offsetX,
    offsetY,
  }
}

module.exports = ImageComposer
