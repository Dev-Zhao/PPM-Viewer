import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import imageIcon from './icons/image.png';
import './App.css';

const App = () => {
  const [imageFile, setImageFile] = useState();
  const [imageData, setImageData] = useState();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  const [errorMsg, setErrorMsg] = useState();
  const { getRootProps, getInputProps, acceptedFiles, fileRejections } = useDropzone({
    accept: '.ppm',
    maxFiles: 1,
  });

  const canvRef = useRef();

  const acceptedFile = acceptedFiles.length > 0 ? acceptedFiles[0] : null;
  useEffect(() => {
    setImageFile(acceptedFile);
    setErrorMsg('');

    if (!acceptedFile) return;

    let reader = new FileReader();
    reader.readAsText(acceptedFile);

    // Read the image file and draw it on the canvas
    reader.onload = function () {
      // PPM Format example: https://en.wikipedia.org/wiki/Netpbm#PPM_example
      let lines = reader.result.trim().split('\n');
      if (lines < 3) {
        setErrorMsg('Invalid PPM image file format - too few lines');
        return;
      }

      // First line contains the magic number
      let magicNum = lines[0].trim();
      // Second line contains width and height of image
      let widthHeightData = lines[1].trim().split(' ');
      let width = Number(widthHeightData[0]);
      let height = Number(widthHeightData[1]);
      // Third line contains maximum value for color
      let maxColorValue = Number(lines[2]);

      let error = null;
      if (magicNum !== 'P3') error = 'Bad PPM image file format - magic number must be "P3"';
      else if (isNaN(width)) error = 'Bad PPM image file format - image width is not a number';
      else if (isNaN(height)) error = 'Bad PPM image file format - image height is not a number';
      else if (isNaN(maxColorValue)) error = 'Bad PPM image file format - maximum color value is not a number';
      else if (width * height !== lines.length - 3)
        error = `Bad PPM image file format - Not enough lines of pixel data (found: ${lines.length - 3}, expecting: ${
          width * height
        }), based on width = ${width} and height = ${height}`;
      if (error) {
        setErrorMsg(error);
        return;
      }

      let canvas = canvRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');

      // The rest of the lines contains pixel color data, each pixel's data is on its own line
      let index = 3;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++, index++) {
          let pixelData = lines[index].trim().split(' ');
          if (pixelData.length !== 3) {
            setErrorMsg(
              `Bad PPM image file format - Pixel data at line ${
                index + 1
              } is invalid (must contain 3 numbers separated by spaces from 0 - ${maxColorValue})`
            );
            return;
          }

          let r = Number(pixelData[0]);
          let g = Number(pixelData[1]);
          let b = Number(pixelData[2]);
          if (isNaN(r) || isNaN(g) || isNaN(b)) {
            setErrorMsg(
              `Bad PPM image file format - Pixel data at line ${
                index + 1
              } is invalid (must contain 3 numbers separated by spaces from 0 - ${maxColorValue})`
            );
            return;
          }

          r = Math.floor((r / maxColorValue) * 255.9999);
          g = Math.floor((g / maxColorValue) * 255.9999);
          b = Math.floor((b / maxColorValue) * 255.9999);
          ctx.fillStyle = `rgba(${r},${g},${b}, 255)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      setImageSize({ width: width, height: height });
      setCanvasSize({ width: width, height: height });
    };

    reader.onerror = function () {
      setErrorMsg('Failed to read PPM image file.');
    };
  }, [acceptedFile]);

  useEffect(() => {
    if (fileRejections.length === 1) {
      setErrorMsg('Only files with the .ppm extension are allowed!');
    } else if (fileRejections.length > 1) {
      setErrorMsg('Only 1 PPM image can be loaded at a time!');
    } else {
      setErrorMsg(null);
    }
  }, [fileRejections.length]);

  const onCanvasWidthChange = (e) => {
    let newWidth = !e.target.value || e.target.value < 0 ? 0 : e.target.value;
    let newHeight = canvasSize.height;
    if (keepAspectRatio) {
      let aspectRatio = imageSize.width / imageSize.height;
      newHeight = newWidth / aspectRatio;
    }
    setCanvasSize({ width: newWidth, height: newHeight });
  };

  const onCanvasHeightChange = (e) => {
    let newWidth = canvasSize.Width;
    let newHeight = !e.target.value || e.target.value < 0 ? 0 : e.target.value;
    if (keepAspectRatio) {
      let aspectRatio = imageSize.width / imageSize.height;
      newWidth = newHeight * aspectRatio;
    }
    setCanvasSize({ width: newWidth, height: newHeight });
  };

  useEffect(() => {
    let timeout = setTimeout(() => {
      let canvas = canvRef.current;
      if (!canvas || !imageData || imageSize.width === 0 || imageSize.height === 0) return;

      // Update canvas size
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      canvas.style.width = canvasSize.width + 'px';
      canvas.style.height = canvasSize.height + 'px';

      // Draw the scaled image on to the canvas
      if (canvas.width !== 0 && canvas.height !== 0) {
        let tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.max(canvasSize.width, imageSize.width);
        tempCanvas.height = Math.max(canvasSize.height, imageSize.height);
        let tempCanvasCtx = tempCanvas.getContext('2d');
        tempCanvasCtx.putImageData(imageData, 0, 0);
        
        canvas.getContext('2d').scale(canvas.width / imageSize.width, canvas.height / imageSize.height);
        canvas.getContext('2d').drawImage(tempCanvas, 0, 0);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [canvasSize, imageData, imageSize.width, imageSize.height]);

  const onDownloadBtnClick = () => {
    if (!canvRef.current) return;
    let downloadLink = document.createElement('a');
    let imageURL = canvRef.current.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    downloadLink.download = imageFile.name + '.png';
    downloadLink.href = imageURL;
    downloadLink.click();
  };

  return (
    <div className="App">
      <h1 >PPM Image Viewer</h1>
      <span>By: Yu Chen Zhao ❤️<br/></span>
      <a href="https://github.com/Dev-Zhao/PPM-Viewer">Github Repo</a>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <img className="dropzone-icon" src={imageIcon} alt="File Icon" />
        <span className="dropzone-heading">Drag and Drop</span>
        <span>
          <i>{imageFile?.name}</i>
          {imageFile ? ` - ${imageSize.width}x${imageSize.height}` : null}
        </span>
        <span>
          Drop PPM images here or
          <br />
          click to select from your computer.
        </span>
      </div>
      {errorMsg ? (
        <div className="error">
          <p>
            <strong>ERROR</strong>: {errorMsg}
          </p>
        </div>
      ) : null}
      {imageFile ? (
        <div className="canvas-container">
          <div className="canvas-controls">
            <div className="canvas-size-control">
              <span>Change canvas size: </span>
              <input
                type="number"
                className="canvas-size-input"
                name="canvas-width"
                placeholder="Width"
                onChange={onCanvasWidthChange}
                value={canvasSize.width}
              ></input>
              <input
                type="number"
                className="canvas-size-input"
                name="canvas-height"
                placeholder="Height"
                onChange={onCanvasHeightChange}
                value={canvasSize.height}
              ></input>
            </div>
            <div>
              <input
                type="checkbox"
                name="keep-aspect-ratio"
                onChange={() => setKeepAspectRatio(!keepAspectRatio)}
                checked={keepAspectRatio}
              />
              <label htmlFor="keep-aspect-ratio">Keep original aspect ratio</label>
            </div>
          </div>
          <canvas className="canvas" ref={canvRef}></canvas>
          <button className="download-btn" onClick={onDownloadBtnClick}>
            Download Image
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default App;
