//VARIABLES
var htmlCanvas = document.getElementById('c'),
    ctx = htmlCanvas.getContext('2d'),
    raito_height = 1080,
    ratio_width = 1980,
    
    scaledWidth = window.innerWidth/ratio_width,
    scaledHeight = window.innerHeight/raito_height,
    f = (scaledHeight+scaledWidth)/2,
    codes = {
        w:87,
        s:83,
        a:65,
        d:68
    },
    pressedKeys = {},
    platforms = [];


randint = function(min, max){return Math.random() * (max - min) + min;};
htmlCanvas.width = 1280;
htmlCanvas.height = 720;



//CLASS
class Player{
    constructor(){
        this.pos = {
            x: htmlCanvas.width/2,
            y: htmlCanvas.height-200
        }
        this.size = {
            w: 50,
            h: 50
        }
        this.color = "blue";
        //activates when player is stepping on first platform
        this.floorislava = false;
        this.onGround = true;
        //force of gravity working for player
        this.gravityForce = 0.03;
        //horizontall move slowness when touching the ground IF GREATER THEN STRONGS THEN PLAYER IS SLOWER
        this.moveSlowness = 0.02;
        //horizontall move slowness when un the air IF GREATER THEN STRONGER THEN PLAYER IS SLOWER
        this.airmoveSlowness = 0.023;
        //if player's part is in the "wall" it will create its "mirror" on other side
        this.mirror = false;
        //mirror position
        this.mirror_pos = {
            x: 0,
            y: 0
        }
        this.mirror_size = {
            w: 0,
            h: 0
        }
        //acceleration (przyspieszenie) !NIE PRĘDKOŚĆ!
        this.velocity = {
            x:0,
            y:0
        }
        //position of sides of a player
        this.sides = {
            bottom: this.pos.y + this.size.h,
            top: this.pos.y,
            left: this.pos.x,
            right: this.pos.x + this.size.w
        }
        //sets the speed for the player
        this.speed = {
            horizontal: 0.04,
            vertical: 4.2
        }
        //sets the maximum speed for player
        this.maxSpeed = {
            vertical: 1000,
            horizontalPlus: 3,
            horizontalMinus: -3
        }
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.w, this.size.h);
        if(this.mirror==true){
            ctx.fillStyle = "red";
            ctx.fillRect(this.mirror_pos.x, this.mirror_pos.y, this.mirror_size.w, this.mirror_size.h);
        }
        
    }
    update(){
        //if player is on the ground than move slowness is the ground one
        if(this.onGround == true){
            //for left (velocity on -)
            if(this.velocity.x>0){
                this.velocity.x -= this.moveSlowness;
            }
            //for right (velocity on +)
            else if(this.velocity.x<0){
                this.velocity.x += this.moveSlowness;
            }
        }
        //if player isn't on the ground than move slowness is the air one
        if(this.onGround == false){
            //player isn'y on the ground so gravity force is working on players y velocity
            this.velocity.y += this.gravityForce;

            //for left (velocity on -)
            if(this.velocity.x>0){
                this.velocity.x -= this.airmoveSlowness;
            }
            //for right (velocity on +)
            else if(this.velocity.x<0){
                this.velocity.x += this.airmoveSlowness;
            }
        }

        //move player with its acceleration
        this.pos.y += this.velocity.y;
        this.pos.x += this.velocity.x;

        //updating sides variables
        this.sides = {
            bottom: this.pos.y + this.size.h,
            top: this.pos.y,
            left: this.pos.x,
            right: this.pos.x + this.size.w
        }

        //BOTTOM
        //if bottom is touching the ground
        if(this.sides.bottom > htmlCanvas.height){
            this.velocity.y = 0;
            //there might be a situation when player's part is "underground"
            this.pos.y = htmlCanvas.height - this.size.h;
            this.onGround = true;
        }
        //if bottom isn't touching ground
        if(this.sides.bottom < htmlCanvas.height){
            this.onGround = false;
        }

        //SIDES
        //this shitty math took me 20 min of hard thinking (yeah im dumb)
            //left
            if(this.sides.left<0){
                //if player fully goes to side player will apear on other side (right)
                if((this.sides.left+this.size.w)<0){
                    this.pos.x = this.mirror_pos.x;
                    this.mirror = false;
                }

                //adding the mirror
                this.mirror = true;
                this.mirror_size.w = this.size.w - this.sides.right;
                this.mirror_size.h = this.size.h;
                this.mirror_pos.x = htmlCanvas.width - (this.size.w - this.sides.right);
                this.mirror_pos.y = this.pos.y;
            }
            //right
            else if(this.sides.right>htmlCanvas.width){
                //if player fully goes to side player will apear on other side (left)
                if((this.sides.right-htmlCanvas.width)>this.size.w){
                    this.pos.x = this.mirror_pos.x;
                    this.mirror = false;
                }

                //adding the mirror
                this.mirror = true;
                this.mirror_size.w = this.sides.right - htmlCanvas.width;
                this.mirror_size.h = this.size.h;
                this.mirror_pos.x = 0;
                this.mirror_pos.y = this.pos.y;

            }
            //if not
            else{
                this.mirror = false;
                //prevending the show of the lagged position of mirror, so small doesnt mirror apears in wrong side
                this.mirror_size.w = 0;
                this.mirror_size.h = 0;
                this.mirror_pos.x = 0;
                this.mirror_pos.y = 0;
            }
            

        //Additional speed limiter
            //horizontal
            if(this.maxSpeed.horizontalMinus>this.velocity.x){
                this.velocity.x = this.maxSpeed.horizontalMinus;
            }
            if(this.maxSpeed.horizontalPlus<this.velocity.x){
                this.velocity.x = this.maxSpeed.horizontalPlus;
            }
            //vertical
            if(this.maxSpeed.vertical<this.velocity.y){
                this.velocity.y = this.maxSpeed.vertical;
            }


        //KEYS
        if(pressedKeys[codes.w]==true){
            //he is acually jumping not flying up
            if(this.onGround==true){
                //only when player hasn't reached vertical max speed
                if(this.maxSpeed.vertical>this.velocity.y){
                    this.velocity.y -= this.speed.vertical;
                }
            }
        }
        if(pressedKeys[codes.a]==true){
            //only when player hasn't reached horizontal max speed (for left -)
            if(this.maxSpeed.horizontalMinus<this.velocity.x){
                this.velocity.x -= this.speed.horizontal;
            }
        }
        if(pressedKeys[codes.d]==true){
            //only when player hasn't reached horizontal max speed (for right +)
            if(this.maxSpeed.horizontalPlus>this.velocity.x){
                this.velocity.x += this.speed.horizontal;
            }
        }
    }
}
class Platform{
    constructor(){
        this.color = "black";
        this.velocity = {
            x: 0,
            y: 0.5
        }
        this.size = {
            w: 200,
            h: 20
        }
        this.pos = {
            x: randint(10, htmlCanvas.width-this.size.w-10),
            y: 100
        }
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.w, this.size.h);
    }
    update(){
        this.pos.y += this.velocity.y;
        this.pos.x += this.velocity.x;

        if(this.pos.y>htmlCanvas.height+10){
            this.pos.y = -10;
            this.pos.x = randint(10, htmlCanvas.width-this.size.w-10);
        }

    }
}
//calling classes
const platform = new Platform();
const player = new Player();




//GAME FUNCTIONS
function update(){
    platform.update();
    player.update();
    redraw();
}
function redraw() {
    ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
    ctx.beginPath();

    player.draw();
    platform.draw();
    

    ctx.stroke();
}



    //Game loop function
    loop = function(){
        setTimeout(()=>{
            update();
            loop();
        },5)
    }


    //window listeners
    window.addEventListener('resize', ()=>{
        /*scaledWidth = window.innerWidth/ratio_width,
        scaledHeight = window.innerHeight/raito_height;

        f = (scaledHeight+scaledWidth)/2;

        htmlCanvas.width = window.innerWidth;
        htmlCanvas.height = window.innerHeight;

        console.log("Window Height: "+window.innerHeight + ",  Window Width:" +window.innerWidth + ", scale factor: "+f);*/
    }, false);
    window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
    window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }


    loop();
