var htmlCanvas = document.getElementById('c'),
    ctx = htmlCanvas.getContext('2d'),


    raito_height = 1080,
    ratio_width = 1980,

    scaledWidth = window.innerWidth/ratio_width,
    scaledHeight = window.innerHeight/raito_height,
    f = (scaledHeight+scaledWidth)/2;


htmlCanvas.width = window.innerWidth;
htmlCanvas.height = window.innerHeight;

htmlCanvas.style.width = "100%";
htmlCanvas.style.height = "100%";

    

var player = {x:20,y:20,w:150,h:150};
    

  function main() {
    window.addEventListener('resize', ()=>{
            scaledWidth = window.innerWidth/ratio_width,
            scaledHeight = window.innerHeight/raito_height;

            f = (scaledHeight+scaledWidth)/2;

        htmlCanvas.width = window.innerWidth;
        htmlCanvas.height = window.innerHeight;

        console.log("Window Height: "+window.innerHeight + ",  Window Width:" +window.innerWidth + ", scale factor: "+f);
    }, false);

    loop();
  }

  function update(){
    player.x+=2;
    redraw();
  }

  function redraw() {
    ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
    ctx.beginPath();
    

    ctx.rect(player.x*f, player.y*f, player.w*f, player.h*f);

    ctx.stroke();
  }

    
    loop = function(){
        setTimeout(()=>{
            update();
            loop();
        },1)
    }

    scaleObj = function(obj){
        //getting every keys from object (obj)
        for(let key in obj){
            //only if key of object is number
            if(typeof obj[key] == "number"){
                //multiplying every keys we get by scale factor
                obj[key] *= f;
            }
        }
    }

  main();