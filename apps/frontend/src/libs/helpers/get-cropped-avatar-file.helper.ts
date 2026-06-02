const AVATAR_OUTPUT_SIZE_PX = 400;
const CANVAS_DESTINATION_X = 0;
const CANVAS_DESTINATION_Y = 0;
const JPEG_QUALITY = 0.92;

type PixelCrop = {
  height: number;
  width: number;
  x: number;
  y: number;
};

const loadImage = (source: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', () => {
      resolve(image);
    });
    image.addEventListener('error', () => {
      reject(new Error('Image load failed'));
    });
    image.src = source;
  });
};

const getCroppedAvatarFile = async (
  imageSource: string,
  pixelCrop: PixelCrop,
  originalFileName: string
): Promise<File> => {
  const image = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas is not supported');
  }

  canvas.width = AVATAR_OUTPUT_SIZE_PX;
  canvas.height = AVATAR_OUTPUT_SIZE_PX;

  const { height, width, x, y } = pixelCrop;

  context.drawImage(
    image,
    x,
    y,
    width,
    height,
    CANVAS_DESTINATION_X,
    CANVAS_DESTINATION_Y,
    AVATAR_OUTPUT_SIZE_PX,
    AVATAR_OUTPUT_SIZE_PX
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to encode image'));
        }
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });

  const baseName = originalFileName.replace(/\.[^/.]+$/, '') || 'avatar';

  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
};

export { getCroppedAvatarFile };
