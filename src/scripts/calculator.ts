const calculateDRingPlacement = (width: number, height: number) => {
  // Start with a baseline placement at 1/3 the height of the canvas
  let placement = height / 3;

  // Define a threshold for significant width difference
  const widthHeightRatioThreshold = 1.5;

  // Define a size threshold where larger canvases might need extra support
  const sizeThreshold = 60; // This threshold can be adjusted based on typical canvas sizes that need more support

  // Initialize a variable to hold any additional height adjustment
  let additionalHeight = 0;

  // Check if the width significantly exceeds the height
  if (width / height > widthHeightRatioThreshold) {
    additionalHeight = (width - height) / 200; // Proportional adjustment based on excess width
  }

  // Check if the canvas size exceeds the general size threshold
  if (width > sizeThreshold || height > sizeThreshold) {
    additionalHeight = Math.max(additionalHeight, 0.05 * height); // Proportional adjustment based on 5% of height
  }

  // Apply the additional height but ensure it does not exceed a move from 1/4 to 1/3 of height
  placement = Math.min(placement, height / 4 + additionalHeight);

  // Ensure the placement does not fall below 1/4 or above 1/3 of the height
  placement = Math.min(Math.max(placement, height / 4), height / 3);

  // Round the placement to the nearest half inch
  placement = Math.round(placement * 2) / 2;
  const adjustment = (height / 3) - placement;
  const adjRatio = adjustment / placement;
  console.warn('ADJUSTED DEFAULT RING DISTANCE BY RATIO', adjRatio);
  
  // return {
  //   placement: Math.round((height / 3) * 2) / 2,
  //   adjustment: 0,
  // }
  return {
    placement,
    adjustment,
  }
}

export {
  calculateDRingPlacement,
}