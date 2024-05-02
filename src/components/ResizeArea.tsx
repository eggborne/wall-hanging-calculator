import './ResizeArea.css';
import { useLayoutEffect, useState, useRef, useEffect } from 'react';
import { toFraction } from 'fraction-parser';

const getFraction = (decimal: number) => {
  console.warn('dec', decimal)
  let finalValue;
  const stringValue = toFraction(decimal, { useUnicodeVulgar: false });
  if (decimal > 1) {
    const wholeNumber = parseInt(stringValue.split(' ')[0]);
    let numerator = 0;
    let denominator = 0;
    if (stringValue.split(' ')[1]) {
      numerator = parseInt(stringValue.split(' ')[1].split('/')[0]);
      denominator = parseInt(stringValue.split(' ')[1].split('/')[1]);
    }
    finalValue = (wholeNumber * denominator) + numerator + '/' + denominator;
  } else {
    finalValue = stringValue;
  }
  return finalValue;
}

const ResizeArea = () => {
  const imagePreviewRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(1);
  const [imageHeight, setImageHeight] = useState<number>(1);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<number | null>(null);

  const changeImageSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dimension: string = e.target.name;
    const newValue: number = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
    console.log('new', dimension, 'is', newValue);
    const imageStateChange = dimension === 'width' ? setImageWidth : setImageHeight;
    imageStateChange(newValue);
  };


  useLayoutEffect(() => {
    if (!loaded) {
      const computedWidth = imagePreviewRef.current?.getBoundingClientRect().width ?? null;
      console.warn('computedWidth', computedWidth)
      setPreviewWidth(computedWidth);
      setLoaded(true);
    };
  }, [loaded]);

  useEffect(() => {
    if (imageWidth && imageHeight) {
      setPreviewAspectRatio(imageWidth / imageHeight);
    }
  }, [imageWidth, imageHeight])

  return (
    <div style={{
      opacity: loaded ? '1' : '0',
    }} className='tool-area resize-area'>
      <div className='dimensions-area'>
        <div className='dimension-entry-area'>
          <label>Width:</label>
          <input type='number' name='width' onChange={changeImageSize}></input>
        </div>
        <div className='dimension-entry-area'>
          <label>Height:</label>
          <input type='number' name='height' onChange={changeImageSize}></input>
        </div>
        <div className='aspect-ratio-display'>
          {imageWidth && imageHeight &&
            <>
              <p>
                Aspect ratio:
              </p>
              <p>
                {previewAspectRatio}
              </p>
              <p>
                (≈ {previewAspectRatio && getFraction(previewAspectRatio)})
              </p>
            </>
          }
        </div>
      </div>
      <div className='image-preview-area' ref={imagePreviewRef}>
        <div className='image-area'
          style={{
            height: previewWidth + 'px',
          }}
        >
          <div className='image-preview'
            style={
              (imageWidth && imageHeight && imageWidth > imageHeight)
                ? { width: '100%', aspectRatio: previewAspectRatio?.toString() }
                : { height: '100%', aspectRatio: previewAspectRatio?.toString() }
            }
          >
            image in here
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizeArea;
