/**
 * @arg {HTMLImageElement} image
 * @return {Number[]} [fullWidth, fullHeight]
 */
const getImageLength = (image) => new Promise(resolve=>{
    if (image.complete) return resolve([image.width, image.height]);
    image.addEventListener("load", e=>{
        return resolve([e.target.width, e.target.height]);
    });
});
const newImageCrop = (obj) => new ImageCrop(obj);
/** 
 * @arg {HTMLImageElement} image
 * @arg {Number} cropMethod
 * 
 * @return {String[]}
*/
const createImageCrop = async (image, cropMethod=4) => {
    const [fullWidth, fullHeight] = await getImageLength(image);
    console.log(fullHeight, fullWidth);
    const crops = (()=>{
        switch (cropMethod) {
            case 2:
                return Array.from(Array(2).keys()).map(el=>(({image, imageType:"image/png", outputWidth: fullWidth / 2, outputHeight: fullHeight})));
            case 3:
                return [
                    ({image, imageType:"image/png", outputWidth: fullWidth / 2 ,outputHeight: fullHeight}),
                    ({image, imageType:"image/png", outputWidth: fullWidth / 2 ,outputHeight: fullHeight / 2}),
                    ({image, imageType:"image/png", outputWidth: fullWidth / 2 ,outputHeight: fullHeight / 2})
                ];
            case 4:
                return Array.from(Array(4).keys()).map(el=>(({image, imageType:"image/png", outputWidth: fullWidth/2, outputHeight: fullHeight/2})));
            default: return [];
        }
    })();
    const cropCoordMap = (()=>{
        switch (cropMethod) {
            case 2:
                return [{x:0, y:0, width:fullWidth/2, height:fullHeight}, {x:fullWidth/2, y:0, width:fullWidth/2, height:fullHeight}];
            case 3:
                return [
                    {x:0, y:0, width:fullWidth/2, height:fullHeight},
                    {x:fullWidth/2, y:0, width:fullWidth/2, height:fullHeight/2},
                    {x:fullWidth/2, y:fullHeight/2, width:fullWidth/2, height:fullHeight/2}
                ];
            case 4:
                return [
                    {x:0, y:0, width:fullWidth/2, height:fullHeight/2},
                    {x:fullWidth/2, y:0, width:fullWidth/2, height:fullHeight/2},
                    {x:0, y:fullHeight/2, width:fullWidth/2, height:fullHeight/2},
                    {x:fullWidth/2, y:fullHeight/2, width:fullWidth/2, height:fullHeight/2}
                ];
            default: return [];
        }
    })();
    
    return crops.map((crop, idx)=>{
        crop = new ImageCrop(crop);
        crop.cropCoords = cropCoordMap[idx];
        return crop.save();
    });
};
/** @type {HTMLInputElement} */
const imageInput = document.querySelector(`input#image-file`);
const cropMethod = document.querySelector(`select#image-crop-method`);
const imageContainer = document.querySelector`.img-container`;
const form = document.querySelector`form#image-crop-form`;
/** @type {String[]} */
let images = [];
let imageName = '';
form.addEventListener("submit", async e=>{
    e.preventDefault();

    const imageFile = ((files)=>{
        const file = files[0];
        imageName = file.name;
        const image = new Image();
        image.src = window.URL.createObjectURL(file);
        return image;
    })(imageInput.files);
    images = await createImageCrop(imageFile, +cropMethod.value);
    // const [height, width] = await getImageLength(imageFile);
    imageContainer.dataset.crops = cropMethod.value;

    imageContainer.innerHTML = '';
    images.forEach((el, idx)=>{
        imageContainer.innerHTML += `
        <div class='img-wrapper'>
            <img src="${el}" />
        </div>
        `;
    });
});
document.querySelector`button#save-images`.addEventListener('click', e=>{
    images.map((el, idx)=>{
        let a = document.createElement('a');
        a.href = el;
        a.download = `${imageName}_CROP${cropMethod.value}_${String(idx+1).padStart(2,'0')}.png`;
        return a;
    }).forEach(a=>{
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
})