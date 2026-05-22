import clsx from 'clsx';
import { type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { type Area, type CropperProps } from 'react-easy-crop';
import * as ReactEasyCrop from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

import { Button, Icon, Image } from '~/libs/components/components.js';
import { ButtonColor } from '~/libs/enums/enums.js';
import { getCroppedAvatarFile } from '~/libs/helpers/get-cropped-avatar-file.helper.js';
import { isAllowedAvatarImageFile } from '~/libs/helpers/is-allowed-avatar-image-file.helper.js';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from '~/libs/hooks/hooks.js';

import styles from './styles.module.scss';

const Cropper = ReactEasyCrop.default as unknown as ComponentType<CropperProps>;

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_SLIDER_STEP = 0.05;

type Properties = {
  applyLabel: string;
  cameraIconClassName: string;
  cancelLabel: string;
  cropTitle: string;
  imagePreviewAlt: string;
  imageUrl: null | string;
  inputId: string;
  labelClassName: string;
  onCroppedFile: (file: File) => void;
  zoomLabel: string;
};

const CircularAvatarCropField = ({
  applyLabel,
  cameraIconClassName,
  cancelLabel,
  cropTitle,
  imagePreviewAlt,
  imageUrl,
  inputId,
  labelClassName,
  onCroppedFile,
  zoomLabel
}: Properties): JSX.Element => {
  const titleId = useId();
  const fileInputReference = useRef<HTMLInputElement>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [pendingCropSource, setPendingCropSource] = useState<null | string>(
    null
  );
  const [pendingOriginalName, setPendingOriginalName] = useState<string>('');
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(MIN_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const pendingSourceReference = useRef<null | string>(null);

  const revokePendingCropSource = useCallback((): void => {
    setPendingCropSource(current => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });
  }, []);

  const closeCropModal = useCallback((): void => {
    setIsCropModalOpen(false);
    revokePendingCropSource();
    setPendingOriginalName('');
    setCroppedAreaPixels(null);
    setZoom(MIN_ZOOM);
    setCrop({ x: 0, y: 0 });
  }, [revokePendingCropSource]);

  useEffect(() => {
    pendingSourceReference.current = pendingCropSource;
  }, [pendingCropSource]);

  useEffect(() => {
    return (): void => {
      if (pendingSourceReference.current) {
        URL.revokeObjectURL(pendingSourceReference.current);
      }
    };
  }, []);

  const handleCancelCrop = useCallback((): void => {
    closeCropModal();

    if (fileInputReference.current) {
      fileInputReference.current.value = '';
    }
  }, [closeCropModal]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { files } = event.target;
      const [file] = files ?? [];

      if (!file) {
        event.target.value = '';

        return;
      }

      if (!isAllowedAvatarImageFile(file)) {
        event.target.value = '';

        return;
      }

      const objectUrl = URL.createObjectURL(file);

      setPendingOriginalName(file.name);
      setPendingCropSource(previous => {
        if (previous) {
          URL.revokeObjectURL(previous);
        }

        return objectUrl;
      });
      setZoom(MIN_ZOOM);
      setCrop({ x: 0, y: 0 });
      setCroppedAreaPixels(null);
      setIsCropModalOpen(true);
      event.target.value = '';
    },
    []
  );

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixelsValue: Area): void => {
      setCroppedAreaPixels(croppedAreaPixelsValue);
    },
    []
  );

  const handleApplyCrop = useCallback(async (): Promise<void> => {
    if (!pendingCropSource || !croppedAreaPixels) {
      return;
    }

    setIsApplying(true);

    try {
      const file = await getCroppedAvatarFile(
        pendingCropSource,
        croppedAreaPixels,
        pendingOriginalName
      );

      onCroppedFile(file);
      closeCropModal();

      if (fileInputReference.current) {
        fileInputReference.current.value = '';
      }
    } catch {
      /* keep modal open so the user can retry */
    } finally {
      setIsApplying(false);
    }
  }, [
    closeCropModal,
    croppedAreaPixels,
    onCroppedFile,
    pendingCropSource,
    pendingOriginalName
  ]);

  useEffect(() => {
    if (!isCropModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handleCancelCrop();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCancelCrop, isCropModalOpen]);

  const handleZoomInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setZoom(Number.parseFloat(event.target.value));
    },
    []
  );

  const handleApplyCropClick = useCallback((): void => {
    void handleApplyCrop();
  }, [handleApplyCrop]);

  const modal =
    isCropModalOpen &&
    pendingCropSource &&
    createPortal(
      <div className={styles['overlayRoot']}>
        <button
          aria-label={cancelLabel}
          className={styles['backdrop']}
          onClick={handleCancelCrop}
          type="button"
        />
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className={styles['dialog']}
          role="dialog"
          tabIndex={-1}
        >
          <h2 className={styles['title']} id={titleId}>
            {cropTitle}
          </h2>
          <div className={styles['cropSurface']}>
            <Cropper
              aspect={1}
              classes={{}}
              crop={crop}
              cropperProps={{}}
              cropShape="round"
              image={pendingCropSource}
              keyboardStep={1}
              maxZoom={MAX_ZOOM}
              mediaProps={{}}
              minZoom={MIN_ZOOM}
              objectFit="contain"
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              restrictPosition
              rotation={0}
              showGrid={false}
              style={{
                containerStyle: {
                  backgroundColor: 'var(--main-dark, #1a1a1a)',
                  borderRadius: 12,
                  height: '100%',
                  position: 'relative',
                  width: '100%'
                }
              }}
              zoom={zoom}
              zoomSpeed={0.4}
            />
          </div>
          <div className={styles['zoomRow']}>
            <label className={styles['zoomLabel']} htmlFor={`${inputId}-zoom`}>
              {zoomLabel}
            </label>
            <input
              aria-valuemax={MAX_ZOOM}
              aria-valuemin={MIN_ZOOM}
              className={styles['zoomRange']}
              id={`${inputId}-zoom`}
              max={MAX_ZOOM}
              min={MIN_ZOOM}
              onChange={handleZoomInputChange}
              step={ZOOM_SLIDER_STEP}
              type="range"
              value={zoom}
            />
          </div>
          <div className={styles['actions']}>
            <Button
              color={ButtonColor.GRAY}
              isFluid
              onClick={handleCancelCrop}
              type="button"
            >
              {cancelLabel}
            </Button>
            <Button
              color={ButtonColor.TEAL}
              isDisabled={!croppedAreaPixels || isApplying}
              isFluid
              isLoading={isApplying}
              isPrimary
              onClick={handleApplyCropClick}
              type="button"
            >
              {applyLabel}
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <label className={labelClassName} htmlFor={inputId}>
        {imageUrl ? (
          <>
            <Image
              alt={imagePreviewAlt}
              height="144"
              isCircular
              src={imageUrl}
              width="144"
            />
            <div className={clsx(cameraIconClassName, styles['cameraIcon'])}>
              <Icon height={48} name="camera" width={48} />
            </div>
          </>
        ) : (
          <div className={clsx(cameraIconClassName, styles['cameraIcon'])}>
            <Icon height={48} name="camera" width={48} />
          </div>
        )}
        <input
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className={styles['hiddenInput']}
          id={inputId}
          onChange={handleFileChange}
          ref={fileInputReference}
          type="file"
        />
      </label>
      {modal}
    </>
  );
};

export { CircularAvatarCropField };
