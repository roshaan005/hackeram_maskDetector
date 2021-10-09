
const container = document.querySelector(".container")
const markMessage = document.createElement("div")
const noMaskMessage = document.createElement("div")
markMessage.classList.add("mask")
noMaskMessage.classList.add("no-mask")

const startDetectBtn = document.querySelector(".btn")
const loader = document.createElement("img")
loader.src = "loading.png"
loader.classList.add("rotate")


console.log(video)

 
  /* JS comes here */
 async function compare() {
    const maskImageCount = 4;
    const noMaskImageCount = 5;
    const trainImagesContainer = document.querySelector(".train-images");
    // Add mask images to the DOM and give them a class of `mask-img`
    for (let i = 1; i <= maskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('src', `mask/${i}.jpg`);
        newImage.classList.add('mask-img');
        trainImagesContainer.appendChild(newImage);
    }
    // Add no mask images to the DOM and give them a class of `no-mask-img`
    for (let i = 1; i <= noMaskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('src', `no_mask/${i}.jpg`);
        newImage.classList.add('no-mask-img');
        trainImagesContainer.appendChild(newImage);
    }

    container.innerHTML = ""
    container.appendChild(loader)



    // Load mobilenet module
    const mobilenetModule = await mobilenet.load({version: 2, alpha: 1});
        // Add examples to the KNN Classifier
        const classifier = await trainClassifier(mobilenetModule);
    // Predict class for the test image
        const testImage = document.getElementById('photo');
        const tfTestImage = tf.browser.fromPixels(testImage);
        const logits = mobilenetModule.infer(tfTestImage, 'conv_preds');
        const prediction = await classifier.predictClass(logits);
    // Add a border to the test image to display the prediction result
        if (prediction.label == 0) { 
            loader.style.display = "none"
            container.appendChild(markMessage)
          
            
            console.log("no")
        } else  if(prediction.label == 1){ // has mask - green border
            loader.style.display = "none"
            container.appendChild(noMaskMessage)

           
        }

  }

  async function trainClassifier(mobilenetModule) {
    // Create a new KNN Classifier
    const classifier = knnClassifier.create();
   // Train using mask images
    const maskImages = document.querySelectorAll('.mask-img');
    maskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 0); // has mask
    });
    // Train using no mask images
    const noMaskImages = document.querySelectorAll('.no-mask-img');
    noMaskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 1); // no mask
    });
return classifier;
}


  

    (function() {
        var width = 320; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream
        var streaming = false;
        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;
    
        function startup() {
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            photo = document.getElementById('photo');
            startbutton = document.getElementById('startbutton');
    
            navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                })
                .then(function(stream) {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function(err) {
                    console.log("An error occurred: " + err);
                });
    
            video.addEventListener('canplay', function(ev) {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);
    
                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }
    
                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }
            }, false);
    
            startbutton.addEventListener('click', function(ev) {
                takepicture();
                ev.preventDefault();
            }, false);
    
            clearphoto();
        }
    
    
        function clearphoto() {
            var context = canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);
            let  data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
        }
    
        function takepicture() {
            var context = canvas.getContext('2d');
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);
                var data = canvas.toDataURL('image/png');
                canvas.style.display = "none"
                photo.setAttribute('src', data);
               
                compare();
            
    
    
    
    
            } else {
                clearphoto();
            }
        }
    
        startDetectBtn.addEventListener("click",function(){
            startup()
            window.scrollBy(0,1000)
        },false)
    })();


   