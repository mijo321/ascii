

    const canvas = document.getElementById("preview");
    const fileInput = document.querySelector('input[type="file"');
    
    const ctx = canvas.getContext("2d");
    

    // Get access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        // Create a video element and set its source to the webcam stream
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        // When the video is playing, start the ASCII conversion
        video.onplaying = () => {
            // Set the canvas dimensions to match the video
            const [width, height] = clampDimensions(video.videoWidth, video.videoHeight);
            canvas.width = width;
            canvas.height = height;

            // Continuously update the canvas with the current video frame
            setInterval(() => {
                ctx.drawImage(video, 0, 0, width, height);
                const grayScales = convertToGreyScale(ctx, width, height);
                drawAscii(grayScales, width);
            }, 1000 / 30); // 30 FPS
        };
    })
    .catch(err => {
        console.error('An error occurred: ', err);
    });

    // got the formula from wikipedia                https://en.wikipedia.org/wiki/Grayscale
    const toGreyScale = (r, g, b) => Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    
    const convertToGreyScale = (ctx, width, height) => {
        // get image data returns array where each pixel is split into 4
        // red green blue alpha
        const imageData = ctx.getImageData(0, 0, width, height);
        const greyScales = [];
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
    
            const greyScale = toGreyScale(r, g, b);
    
            imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = greyScale;
            
            greyScales.push(greyScale);
        }
        ctx.putImageData(imageData, 0, 0);
    
        return greyScales
    }
    
    const greyMap = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'';
    const rampLength = greyMap.length;
    
    // the grayScale value is an integer ranging from 0 (black) to 255 (white)
    const getCharacterForGrayScale = grayScale =>
        greyMap[Math.ceil(((rampLength - 1) * grayScale) / 255)];
    
    const asciiImage = document.querySelector("pre#ascii");
    
    const drawAscii = (grayScales, width) => {
        let ascii = '';
        for (let i = 0; i < grayScales.length; i++) {
            const grayScale = grayScales[i];
            ascii += getCharacterForGrayScale(grayScale);
    
            // If the next pixel is on a new line, add a newline character
            if ((i + 1) % width === 0) {
                ascii += '\n';
            }
        }
    
        asciiImage.textContent = ascii;
    };
    
    const MAXIMUM_WIDTH = 300;
    const MAXIMUM_HEIGHT = 200;
    
    const clampDimensions = (width, height) => {
        const rectifiedWidth = Math.floor(getFontRatio() * width);
        if (height > MAXIMUM_HEIGHT) {
            const reducedWidth = Math.floor(rectifiedWidth * MAXIMUM_HEIGHT / height);
            return [reducedWidth, MAXIMUM_HEIGHT];
        }
    
        if (width > MAXIMUM_WIDTH) {
            const reducedHeight = Math.floor(height * MAXIMUM_WIDTH / rectifiedWidth);
            return [MAXIMUM_WIDTH, reducedHeight];
        }
    
        return [rectifiedWidth, height];
    };
    
    const getFontRatio = () => {
        const pre = document.createElement("pre");
        pre.style.display = "inline";
        pre.textContent = " ";
    
        document.body.appendChild(pre);
        const { width, height } = pre.getBoundingClientRect();
        document.body.removeChild(pre);
    
        return height / width;
    };
    
    const fontRatio = getFontRatio();