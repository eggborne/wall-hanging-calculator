import './ResizeArea.css';
import { useLayoutEffect, useState, useRef, useEffect } from 'react';
import { toFraction } from 'fraction-parser';

const getFraction = (decimal: number) => {
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
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [computedImageWidth, setComputedImageWidth] = useState<number>(0);
  const [computedImageHeight, setComputedImageHeight] = useState<number>(0);
  const [depth, setDepth] = useState<number>(0);
  const [lipSize, setLipSize] = useState<number>(0);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<number | null>(null);
  const [dRingDistance, setDRingDistance] = useState<number>(0);

  const calculateDRingDistance = () => {
    const computedHeight = computedImageHeight;
    const nextDRingDistance = computedHeight / 3;
    console.log('next ring dist', nextDRingDistance)
    return nextDRingDistance;
  }

  const changeImageSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dimension: string = e.target.name;
    const newValue: number | string = isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value);
    console.log('new', dimension, 'is', newValue);
    const computedWidth = computedImageWidth;
    switch (dimension) {
      case 'width':
        newValue >= 9 ? setImageWidth(newValue) : null
        break;
      case 'height':
        newValue >= 9 ? setImageHeight(newValue) : null
        break;
      case 'depth':
        const depthRatio = newValue / imageWidth;
        const actualDepth = computedWidth * depthRatio;
        setDepth(actualDepth / 4);
        break;
      case 'lip-size':
        const lipRatio = newValue / imageWidth;
        const actualLipSize = computedWidth * lipRatio;
        actualLipSize > 0 && setLipSize(actualLipSize);
        break;
    }
    const nextDRingDistance = calculateDRingDistance();
    setDRingDistance(nextDRingDistance);
  };


  useLayoutEffect(() => {
    if (!loaded) {
      setLoaded(true);
    };
  }, [loaded]);

  useEffect(() => {
    if (imageWidth && imageHeight) {
      setPreviewAspectRatio(imageWidth / imageHeight);
      setTimeout(() => {
        setComputedImageWidth(imagePreviewRef.current?.getBoundingClientRect().width as number);
        setComputedImageHeight(imagePreviewRef.current?.getBoundingClientRect().height as number);
      }, 10);
    }
  }, [imageWidth, imageHeight, depth, lipSize]);

  return (
    <div style={{
      opacity: loaded ? '1' : '0',
    }} className='tool-area resize-area'>
      <div className='dimensions-area'>
        <div className='dimension-entry-area'>
          <label>Width</label>
          <input type='number' name='width' onChange={changeImageSize}></input>
        </div>
        <div className='dimension-entry-area'>
          <label>Height</label>
          <input type='number' name='height' onChange={changeImageSize}></input>
        </div>
        <div className='dimension-entry-area'>
          <label>Depth</label>
          <input type='number' name='depth' onChange={changeImageSize}></input>
        </div>
        <div className='dimension-entry-area'>
          <label>Lip size</label>
          <input type='number' name='lip-size' onChange={changeImageSize}></input>
        </div>
        <div className='aspect-ratio-display'>
          {imageWidth && imageHeight &&
            <>
              <p>
                Aspect ratio:
              </p>
              <p>
                {previewAspectRatio?.toFixed(3)}
              </p>
              <p>
                {previewAspectRatio && (previewAspectRatio % 1) ? `(≈ ${getFraction(previewAspectRatio)})` : ``}
              </p>
            </>
          }
        </div>
      </div>
      <div className='image-preview-area' ref={imagePreviewRef}>

        <div className='image-preview'
          style={
            (imageWidth && imageHeight && (imageWidth > imageHeight))
              ? {
                width: '100%',
                aspectRatio: previewAspectRatio?.toString(),
                borderWidth: `${lipSize}px`,
                boxShadow: `${depth}px ${depth}px 0 var(--frame-shadow-color)`
              }
              : {
                height: '100%',
                aspectRatio: previewAspectRatio?.toString(),
                borderWidth: `${lipSize}px`,
                boxShadow: `${depth}px ${depth}px 0rem var(--frame-shadow-color)`
              }
          }
        >
          <div className='d-ring left'
            style={{
              height: (computedImageHeight / imageHeight * 1.5) +'px',
              translate: `0 ${lipSize * -1}px`,
              top: `${dRingDistance}px`,
              left: 0,
            }}
          ></div>
          <div className='d-ring right'
            style={{
              height: (computedImageHeight / imageHeight * 1.5) +'px',
              translate: `0 ${lipSize * -1}px`,
              top: `${dRingDistance}px`,
              right: 0,
            }}
          ></div>
          {(imageWidth && imageHeight) ?
            `${imageWidth} x ${imageHeight}`
            :
            <div className={'form-instruction'}>enter dimensions above</div>
          }
        </div>
      </div>
    </div>
  );
};

export default ResizeArea;
