// import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import OverlayThumbnail from './OverlayThumbnail';

function ImageGallery(props) {
  const { productStyleSelected, expanded, handleExpand } = props;
  const [mainPicUrl, setMainPicUrl] = useState(productStyleSelected.photos[0].url);
  const [currIndex, setCurrIndex] = useState(0);

  // On thumbnail click, set main image to thumbnail's image and current index to thumbnail's index
  const selectMainPic = (overlayThumbnail) => {
    setMainPicUrl(overlayThumbnail.url);
    for (let j = 0; j < productStyleSelected.photos.length; j += 1) {
      // console.log(productStyleSelected.photos[j]);
      if (productStyleSelected.photos[j].url === overlayThumbnail.url) {
        setCurrIndex(j);
        break;
      }
    }
  };

  // To show next picture, up the current index and our hook will handle the render
  const showNextPic = () => {
    // console.log('index before showNextPic', currIndex, length);
    if (currIndex < productStyleSelected.photos.length - 1) {
      setCurrIndex((prevState) => prevState + 1);
      // console.log('index after showNextPic', currIndex);
    }
  };

  // To show previous picture, lower the current index and our hook will handle the render
  const showPrevPic = () => {
    // console.log('index before showPrevPic', currIndex, length);
    if (currIndex > 0) {
      setCurrIndex((prevState) => prevState - 1);
      // console.log('index after showPrevPic', currIndex);
    }
  };

  // Every time a new style is selected, reset main image and current index
  useEffect(() => {
    setMainPicUrl(productStyleSelected.photos[0].url);
    setCurrIndex(0);
  }, [productStyleSelected]);

  // Every time the index changes, update main image to the image at that index
  useEffect(() => {
    setMainPicUrl(productStyleSelected.photos[currIndex].url);
  }, [productStyleSelected, currIndex]);

  const imageGalleryId = expanded ? 'image-gallery-expanded' : 'image-gallery';
  // const imageMainId = expanded ? 'image-main-expanded' : 'image-main';

  // The following uses the Image class to log the width/height of the original image on load.
  // Note that we don't actually need to wait until load to grab the image height/width.
  const getMeta = function (url, callback) {
    var img = new Image();
    img.src = url;
    img.onload = function () { callback(this.width, this.height); }
  };

  // console.log(mainPicUrl);

  // useEffect(()=>{
  //   if (expanded) {
  //     const expandedImage = document.getElementById('image-main-expanded');
  //     console.log(expandedImage);
  //     expandedImage.addEventListener('mousemove', (e) => {
  //       expandedImage.style.left = e.offsetX + 'px';
  //       expandedImage.style.top = e.offsetY + 'px';
  //     });
  //   }
  // }, [expanded]);

  useEffect(() => {
    const imageExpanded = document.getElementById('image-main-expanded');
    const imageContainerExpanded = document.getElementById('image-gallery-expanded');

    const handleMove = (e) => {
      // Coordinates and size of image's container (The portion of the image we can see on screen).
      // Note: Will be strictly less than or equal to the size of the image.
      const imgContainerCoordinatesAndSize = imageContainerExpanded.getBoundingClientRect();

      // Dimensions of image's container
      const imgContainerWidth = imgContainerCoordinatesAndSize.width;
      const imgContainerHeight = imgContainerCoordinatesAndSize.height;
      const imgContainerAspRatio = imgContainerWidth / imgContainerHeight;

      /* Dimensions of image itself
      In order to determine which side of the image gets used to fill a container when applying
        "object-fit: contain", the browser compares the aspect ratio of the image and its container.
      The aspect ratio of the original image vs. the container it's filling up is the key here,
        NOT whether the original image is wider than it is tall. The following would not work:
          const layout = imgOriginalHeight > imgOriginalWidth ? 'tall' : 'wide'; */
      const imgOriginal = new Image();
      imgOriginal.src = mainPicUrl;
      const imgOriginalWidth = imgOriginal.width;
      const imgOriginalHeight = imgOriginal.height;
      const imgOriginalAspRatio = imgOriginalWidth / imgOriginalHeight;
      const layout = ((imgOriginalAspRatio) < (imgContainerAspRatio)) ? 'tall' : 'wide';
      // console.log('imgOriginalWidth', imgOriginalWidth);
      // console.log('imgOriginalHeight', imgOriginalHeight);
      // console.log('layout', layout);

      // Mouse coordinates with respect to image
      // Note: Image container also works here, since both are positioned at top 0/left 0
      const cursorXCoordinate = e.offsetX;
      const cursorYCoordinate = e.offsetY;

      // Turn current mouse coordinates into a % of container width/height
      const cursorXPercentPosition = cursorXCoordinate / imgContainerWidth;
      const cursorYPercentPosition = cursorYCoordinate / imgContainerHeight;

      let imgWidth;
      let imgHeight;

      /* If layout is 'tall', image will expand its width to fill the container. In this case,
          we don't want to scroll the container horizontally; only vertically.
      If layout is 'wide', it's the opposite. Image will expand its height and we will only
          want to scroll it horizontally.
        NOTE: This relies on the original image's aspect ratio being maintained. We guarantee
          this by using "object-fit: contain" */
      if (layout === 'tall') {
        imgWidth = imgContainerWidth;
        imgHeight = (imgContainerWidth * imgOriginalHeight) / imgOriginalWidth - imgContainerHeight;
        // imgHeight = imgWidth;
        // console.log(imgWidth);
        // console.log(imgHeight);
        // imgHeight = (imgWidth / imgOriginalWidth) * imgOriginalHeight;
        let backgroundXPosition = cursorXPercentPosition * imgWidth;
        let backgroundYPosition = cursorYPercentPosition * imgHeight;

        imageExpanded.style.backgroundPositionX = `0px`;
        imageExpanded.style.backgroundPositionY = `${-backgroundYPosition}px`;
      } else if (layout === 'wide') {
        // imgHeight = imgContainerHeight;
        // imgWidth = (imgHeight / imgOriginalHeight) * imgOriginalWidth;
        imgWidth = (imgContainerHeight * imgOriginalWidth) / imgOriginalHeight - imgContainerWidth;
        imgHeight = imgContainerHeight;
        let backgroundXPosition = cursorXPercentPosition * imgWidth;
        let backgroundYPosition = cursorYPercentPosition * imgHeight;
        imageExpanded.style.backgroundPositionX = `${-backgroundXPosition}px`;
        imageExpanded.style.backgroundPositionY = `0px`;
      }

      // imageExpanded.style.backgroundPositionX = `${-e.offsetX}px`;
      // imageExpanded.style.backgroundPositionY = `${-e.offsetY}px`;

      // Coordinates and size of image (blown up in the background) and its container (smaller view)
      // let imgCoordinatesAndSize = imageExpanded.getBoundingClientRect();
      // let imgContainerCoordinatesAndSize = imageContainerExpanded.getBoundingClientRect();

      // console.log('Image coordinates and size', imgCoordinatesAndSize);
      // console.log('Container coordinates and size', imgContainerCoordinatesAndSize);

      // console.log('backgroundXPosition', backgroundXPosition);
      // console.log('backgroundYPosition', backgroundYPosition);

      // let imgToContainerRatioX = imgWidth / imgContainerWidth;
      // let imgToContainerRatioY = imgHeight / imgContainerHeight;

      // let imgContainerAspectRatio = imgContainerWidth / imgContainerHeight;
      // console.log(imgContainerAspectRatio);

      // imageExpanded.style.backgroundPositionX = `${imgWidth - backgroundXPosition}px`;
      // imageExpanded.style.backgroundPositionY = `${imgHeight - backgroundYPosition}px`;

      // imageExpanded.style.backgroundPositionX = `${backgroundXPosition}%`;
      // imageExpanded.style.backgroundPositionY = `${backgroundYPosition}%`;

      // imageExpanded.style.backgroundPositionX = `${-backgroundXPosition / imgContainerAspectRatio}px`;
      // imageExpanded.style.backgroundPositionY = `${-backgroundYPosition * imgContainerAspectRatio}px`;

      // imageExpanded.style.backgroundPositionX = `${-backgroundXPosition / imgToContainerRatioX}px`; //2150/???? undershoot
      // imageExpanded.style.backgroundPositionY = `${-backgroundYPosition * imgToContainerRatioY}px`; //1180/1100 overshoot

      // imageExpanded.style.backgroundPositionX = `${-backgroundXPosition / 2}px`;
      // imageExpanded.style.backgroundPositionY = `${-backgroundYPosition * 2}px`;

      // elExpanded.style.backgroundPositionX = `${cursorXPercentPosition*100}%`;
      // elExpanded.style.backgroundPositionY = `${cursorYPercentPosition*100}%`;

      // console.log('cursorXPercentPosition', cursorXPercentPosition);
      // console.log('cursorYPercentPosition', cursorYPercentPosition);

      // console.log('Image coordinates and size', imgCoordinatesAndSize);
      // console.log('Container coordinates and size', imgContainerCoordinatesAndSize);

      // console.log(elExpanded);
      // console.log('Expanded View Background Size:', elExpanded.style.backgroundSize);
      // console.log(e);
      // elExpanded.style.backgroundPositionX = `${-e.offsetX}px`;
      // elExpanded.style.backgroundPositionY = `${-e.offsetY}px`;
      // elExpanded.style.backgroundPositionX = `${-e.layerX}px`;
      // elExpanded.style.backgroundPositionY = `${-e.layerY}px`;

      // elExpanded.style.backgroundPositionX = `${e.offsetX * 0.1}%`;
      // elExpanded.style.backgroundPositionX = `center`;
      // elExpanded.style.backgroundPositionY = `${e.offsetY * 0.5}%`;

      // console.log('e.offsetX', e.offsetX); // min is -1 on left side, max is 944 on right side
      // console.log('e.offsetY', e.offsetY); // min is -1 on top size, max is 478 on bottom side
      // // makes sense - when inspecting, the box for the image is 944.297 wide x 477.531 tall

      // console.log('getBoundingClientRect', elExpanded.getBoundingClientRect());
      // console.log('getClientRects', elExpanded.getClientRects());
      // 250% view
      // bottom: 1286.546875
      // height: 1193.828125
      // left: 202.34375 // SAME
      // right: 2553.078125
      // top: 92.71875 // SAME
      // width: 2350.734375
      // x: 202.34375 // SAME
      // y: 92.71875 // SAME

      // 100% view
      // bottom: 570.25 // Subtract y from bottom to
      // height: 477.53125
      // left: 202.34375
      // right: 1146.640625
      // top: 92.71875 // SAME
      // width: 944.296875
      // x: 202.34375 // SAME
      // y: 92.71875 // SAME

      // elExpanded.style.backgroundPositionX = `${e.offsetX * 1}%`;
      // elExpanded.style.backgroundPositionY = `${e.offsetY * 0.3}%`;

      // Don't use offsetHeight/offsetWidth - these round to nearest integer, we want exact values
      // console.log('Expanded View Container Offset Height:', elExpandedContainer.offsetHeight);
      // console.log('Expanded View Container Offset Width:', elExpandedContainer.offsetWidth);

      // const windowWidth = window.innerWidth / 5;
      // const windowHeight = window.innerHeight / 5;
      // const mouseX = e.clientX / windowWidth;
      // const mouseY = e.clientY / windowHeight;
      // elExpanded.style.transform = `translate3d(-${mouseX}%, -${mouseY}%, 0)`;
    };

    if (expanded) {
      console.log('Image:', mainPicUrl);
      console.log('Expanded View:', imageExpanded);
      // console.log('Expanded View Style Height:', elExpanded.style.height);
      // console.log('Expanded View Style Width:', elExpanded.style.width);
      // console.log('Expanded View Offset Height:', elExpanded.offsetHeight);
      // console.log('Expanded View Offset Width:', elExpanded.offsetWidth);
      // console.log('Expanded View Container Style Height:', elExpandedContainer.style.height);
      // console.log('Expanded View Container Style Width:', elExpandedContainer.style.width);
      // console.log('Expanded View Container Offset Height:', elExpandedContainer.offsetHeight);
      // console.log('Expanded View Container Offset Width:', elExpandedContainer.offsetWidth);
      // console.log('getBoundingClientRect', elExpanded.getBoundingClientRect());
      // console.log('getClientRects', elExpanded.getClientRects());
      // Getting the background size before mount doesn't work...
      // console.log('Expanded View Background Size:', elExpanded.style.backgroundSize);
      // // Setting the background size works, b/c it doesn't require the element to be mounted yet
      // console.log('Expanded View Background Size:', elExpanded.style.backgroundSize = "60px 120px");

      // console.log(`${imgOriginalWidth}px ${imgOriginalHeight}px`)
      // imageExpanded.style.backgroundSize = `${imgOriginalWidth}px ${imgOriginalHeight}px`;
      imageExpanded.addEventListener('mousemove', handleMove);
      // Need to remove event listener right before expanded image unmounts, or else event listener will remain even after it's gone
      // The event listener would get tied to the default image and end up moving that around, which we don't want.
      return function cleanup() {
        imageExpanded.removeEventListener('mousemove', handleMove);
      };
    }

    if (!expanded) {
      // console.log('Default View:', elDefault);
      // el.removeEventListener("mousemove", handleMove);
    }
    return null;
    // console.log(expanded);
  }, [expanded]);

  // const handleHover = (event) => {
  //   const elExpanded = document.getElementById('image-main-expanded');
  //   console.log('Expanded View Background Size:', elExpanded.style.backgroundSize);
  //   console.log('Expanded View Background Size:', elExpanded.style);

  //   console.log('Expanded View Background Size Event:', event.target.style);
  // };

  return (
    <div id={imageGalleryId}>
      {/* {expanded
        ? (
          <img
            id="image-main-expanded"
            src={mainPicUrl}
          // onClick={handleHover}
          // role="presentation"
          />
        )
        : (
          <img
            id="image-main"
            src={mainPicUrl}
          />
        )} */}
      {expanded
        ? (
          <div
            id="image-main-expanded"
            style={{
              backgroundImage: `url(${mainPicUrl})`,
            }}
          // onClick={handleHover}
          // role="presentation"
          />
        )
        : (
          <div
            id="image-main"
            style={{
              backgroundImage: `url(${mainPicUrl})`,
              backgroundPosition: 'center',
            }}
          />
        )}
      {/* <div id={imageMainId} style={`background-image: url(${mainPicUrl.substring(0, mainPicUrl.length - 1)})`}></div> */}
      {/* <img id={imageMainId} src={mainPicUrl} alt="Main Product" /> */}
      <div id="expand-main-image"><i className="fas fa-expand" onClick={handleExpand} role="presentation" /></div>
      {(currIndex < productStyleSelected.photos.length - 1)
        && <div id="next-overlay-thumbnail-pic"><i className="fas fa-chevron-right" onClick={showNextPic} role="presentation" /></div>}
      {(currIndex > 0)
        && <div id="prev-overlay-thumbnail-pic"><i className="fas fa-chevron-left" onClick={showPrevPic} role="presentation" /></div>}
      <div id="overlay-thumbnail-gallery" className="stylish-right-component">
        {productStyleSelected.photos.map((photo) => (
          <OverlayThumbnail
            overlayThumbnail={photo}
            selectMainPic={selectMainPic}
            mainPicUrl={mainPicUrl}
          />
        ))}
      </div>
    </div>
  );
}

ImageGallery.propTypes = {
  productStyleSelected: PropTypes.instanceOf(Object).isRequired,
  expanded: PropTypes.bool.isRequired,
  handleExpand: PropTypes.func.isRequired,
};

export default ImageGallery;
