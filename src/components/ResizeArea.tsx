import './ResizeArea.css';
import { useState, useRef, useEffect } from 'react';
import { toFraction } from 'fraction-parser';
import { calculateDRingPlacement } from '../scripts/calculator';

const defaultValues = {
  height: 24,
  width: 24,
  depth: 1.5,
  lipSize: 1,
}

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
  const [imageWidth, setImageWidth] = useState<number>(defaultValues.width);
  const [imageHeight, setImageHeight] = useState<number>(defaultValues.height);
  const [computedImageWidth, setComputedImageWidth] = useState<number>(0);
  const [computedImageHeight, setComputedImageHeight] = useState<number>(0);
  const [depth, setDepth] = useState<number>(defaultValues.depth);
  const [lipSize, setLipSize] = useState<number>(defaultValues.lipSize);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<number | null>(null);
  const [dRingDistance, setDRingDistance] = useState<number>(0);

  const getPixelsForScreenUnits = (unitValue: number, unitImageWidth: number) => {
    const ratio = unitValue / unitImageWidth;
    const actualSize = computedImageWidth * ratio;
    return actualSize;
  };

  const changeImageSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dimension: string = e.target.name;
    const newValue: number | string = isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value);
    console.log('new', dimension, 'is', newValue);
    switch (dimension) {
      case 'width':
        setImageWidth(newValue)
        break;
      case 'height':
        setImageHeight(newValue)
        break;
      case 'depth':
        setDepth(getPixelsForScreenUnits(newValue, imageWidth));
        break;
      case 'lip-size':
        setLipSize(getPixelsForScreenUnits(newValue, imageWidth));
        break;
    }
  };

  useEffect(() => {
    console.warn('ran empty array effect')
    if (!loaded) {
      setLoaded(true);
      setImageWidth(defaultValues.width);
      setImageHeight(defaultValues.height);
      setDepth(getPixelsForScreenUnits(defaultValues.depth, defaultValues.width));
      setLipSize(getPixelsForScreenUnits(defaultValues.lipSize, defaultValues.width));
    };
  }, [])

  useEffect(() => {
    console.warn('ran width/height effect')
    setPreviewAspectRatio(imageWidth / imageHeight);
  }, [imageWidth, imageHeight]);

  useEffect(() => {
    console.warn('ran imageWidth, imageHeight, depth, lipSize effect')
    const nextComputedWidth: number = imagePreviewRef.current?.getBoundingClientRect().width || 0;
    const nextComputedHeight: number = imagePreviewRef.current?.getBoundingClientRect().height || 0;
    setComputedImageWidth(nextComputedWidth);
    setComputedImageHeight(nextComputedHeight);
  }, [imageWidth, imageHeight, depth, lipSize]);

  useEffect(() => {
    console.warn('ran computed width/height effect', imageWidth, imageHeight, depth, lipSize)
    // setDepth(getPixelsForScreenUnits(depth, imageWidth));
    // setLipSize(getPixelsForScreenUnits(lipSize, imageWidth));
    const nextDRingDistance = calculateDRingPlacement(computedImageWidth, computedImageHeight);
    setDRingDistance(nextDRingDistance.placement);
  }, [computedImageWidth, computedImageHeight]);

  const dRingSize = computedImageHeight / imageHeight;

  return (
    <>
      <div style={{
        opacity: loaded ? '1' : '0',
      }} className='tool-area resize-area'>
        <div className='dimensions-area'>
          <div className='dimension-entry-area'>
            <label>Width</label>
            <input type='number' min='10' max='100' defaultValue={defaultValues.width} name='width' onChange={changeImageSize}></input>
          </div>
          <div className='dimension-entry-area'>
            <label>Height</label>
            <input type='number' min='10' max='100' defaultValue={defaultValues.height} name='height' onChange={changeImageSize}></input>
          </div>
          <div className='dimension-entry-area'>
            <label>Depth</label>
            <input type='number' min='0.25' max='100' step='0.25' defaultValue={defaultValues.depth} name='depth' onChange={changeImageSize}></input>
          </div>
          <div className='dimension-entry-area'>
            <label>Lip size</label>
            <input type='number' min='0.25' max='100' step='0.25' defaultValue={defaultValues.lipSize} name='lip-size' onChange={changeImageSize}></input>
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
                }
                : {
                  height: '100%',
                  aspectRatio: previewAspectRatio?.toString(),
                }
            }
          >
            <div className='dimension-tag total-width'>{`<------ ${imageWidth} ------>`}</div>
            <div className='dimension-tag total-height'>{`<------ ${imageHeight} ------>`}</div>
            <div className='d-ring left'
              style={{
                height: dRingSize + 'px',
                top: `${dRingDistance}px`,
                left: `${lipSize + (dRingSize / 10)}px`,
              }}
            ></div>
            <div className='d-ring right'
              style={{
                height: dRingSize + 'px',
                top: `${dRingDistance}px`,
                right: `${lipSize + (dRingSize / 10)}px`,
              }}
            ></div>
            <div className='inner-edge'
              style={{
                width: (computedImageWidth - (lipSize * 2)) + 'px',
                height: (computedImageHeight - (lipSize * 2)) + 'px',
                borderWidth: (depth / 2) + 'px',
              }}
            >
            </div>
            <div className='dimensions-label'>{imageWidth} x {imageHeight}</div>
          </div>
        </div>
      </div>
      <p>D-Ring distance: {((dRingDistance / computedImageHeight) * imageWidth).toFixed(1)} from top</p>
      <p>Wire peak height: {((dRingDistance / computedImageWidth / 2) * imageWidth).toFixed(1)} from top</p>
      {/* <p>D-Ring distance: {getFraction(dRingDistance / computedImageWidth)} from top</p>
      <p>Wire peak height: {getFraction(dRingDistance / computedImageWidth / 2)} from top</p> */}
    </>
  );
};

export default ResizeArea;
