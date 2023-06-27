//VARIABLES
var htmlCanvas = document.getElementById('c'),
ctx = htmlCanvas.getContext('2d'),
raito_height = 1080,
ratio_width = 1980,
    
scaledWidth = window.innerWidth/ratio_width,
scaledHeight = window.innerHeight/raito_height,
f = (scaledHeight+scaledWidth)/2;
randint = function(min, max){return Math.ceil(Math.random() * (max - min) + min);};
htmlCanvas.width = 1280;
htmlCanvas.height = 720;

var codes = {
    w:87,
    s:83,
    a:65,
    d:68
},
pressedKeys = {},
platforms = [],
platforms_counter;

//MAKE OBSTABLES IN PLATFORM CLASS 
//OR 
//MAKE ANOTHER OBSTABLE CLASS AND ATACH IT TO PLATFORMS WITH VARIABLES

//CLASS
class Game{
    constructor(){
        this.running = true;
        this.platforms = [];
        this.player;
        this.platforms_counter;
        this.gameSpeed = 1;
        
    }
    update(){
        this.player.update();

        var i = 0
        while(i<this.platforms.length){
            this.platforms[i].update()
            i++;
        }
    }
    redraw(){
        ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
        ctx.beginPath();

        this.player.draw();

        var i = 0
        while(i<this.platforms.length){
            this.platforms[i].draw()
            i++;
        }
    
        ctx.stroke();
    }
    stop(){
        this.running = false;
    }
    lose(){
        console.log("lose");
        this.stop();
    }
    loop(){
        //i have no idea with "this" losses sense but the .bind needs to be there
        setTimeout(function() {  
            this.update()
            this.redraw();                   
            if (this.running==true) {
                this.loop();           
            }                     
        }.bind(this),5)
    }
    run(){
        this.platforms.push(new Platform());
        this.player = new Player()

        this.loop();
    }
    colliding(rac1Top, rac1Bottom, rac1Left, rac1Right, rac2Top, rac2Bottom, rac2Left, rac2Right){
        var ar = {
            isColliding: false,
            direction: "none",
            top: rac2Top,
            bottom: rac2Bottom,
            left: rac2Left,
            right: rac2Right
        };
        var sizeX = rac1Right - rac1Left;
        var sizeY = rac1Bottom - rac1Top;
        var size2X = rac2Right - rac2Left;
        var size2Y = rac2Bottom - rac2Top;
        if(rac1Bottom>rac2Top && rac1Top<rac2Bottom && rac1Left<rac2Right && rac1Right>rac2Left){
            ar.isColliding = true;
            var gapLeft, gapRight, gapTop, gapBottom;
            var attachedX = {direction:"none", diff: 0};
            var attachedY = {direction:"none", diff: 0};
            //check which direction is closer to be out of ractangle 2 and set the direction
        
            gapLeft = rac1Left - rac2Left;
            gapRight = rac2Right - rac1Right;
            gapTop = rac1Top - rac2Top;
            gapBottom = rac2Bottom - rac1Bottom;

            //X
            if(gapRight>gapLeft){attachedX.direction = "left"; attachedX.diff = rac1Right-rac2Left;}
            if(gapRight<gapLeft){attachedX.direction = "right"; attachedX.diff = rac2Right-rac1Left;}
            if(gapRight==gapLeft){attachedX.direction = "centered";} 
        
            //Y
            if(gapTop>gapBottom){attachedY.direction = "bottom"; attachedY.diff = rac2Bottom-rac1Top;}
            if(gapTop<gapBottom){attachedY.direction = "top"; attachedY.diff = rac1Bottom - rac2Top;}
            if(gapTop==gapBottom){attachedY.direction = "centered"; attachedY.diff = 0.1;} 

            //final direction choosing
            if(attachedX.diff<attachedY.diff){
                ar.direction = attachedX.direction;
            }
            else if(attachedX.diff>attachedY.diff){
                ar.direction = attachedY.direction;
            }
            else{
                console.log("How did we get here?");
            }

        }   

        return ar;
    }
}
class Player{
    constructor(){
        this.showPos = true;
        this.moveable = true;
        this.clip = true;
        this.pos = {
            x: htmlCanvas.width/2,
            y: htmlCanvas.height-200
        }
        this.size = {
            w: 50,
            h: 50
        }
        this.score = 0;
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
            vertical: 3.5
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
            ctx.fillRect(this.mirror_pos.x, this.mirror_pos.y, this.mirror_size.w, this.mirror_size.h);
        }
        
    }
    update(){
        //pos (not working)
        if(this.showPos==true){
            ctx.font = "5px Arial"
            ctx.fillText("x:"+this.pos.x + " y:" + this.pos.y, 10, 10)
        }

        //if player is on the ground than move slowness is the ground one
        if(this.clip==true){
            //GRAVITY AND VELOCITY CHANGERS
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
        }

        //COLLISION
        var collider = [];
        //platform collision and score counter
        var i = 0
        while(i<game.platforms.length){
            var plat = game.platforms[i];
            function checkNewCollider(top,bottom,left,right){
                var col = game.colliding(game.player.sides.top,game.player.sides.bottom, game.player.sides.left,game.player.sides.right,
                    top,bottom,left,right);
                if(col.isColliding==true){
                    collider.push(col);
                }
            }

            //NEUTRAL COLLISION
            //platforms
            checkNewCollider(plat.sides.top,plat.sides.bottom,plat.sides.left,plat.sides.right);
            checkNewCollider(plat.sides2.top,plat.sides2.bottom,plat.sides2.left,plat.sides2.right)
            //wall obstacles
            checkNewCollider(plat.ObstacleWall_sides.top, plat.ObstacleWall_sides.bottom,
                plat.ObstacleWall_sides.left, plat.ObstacleWall_sides.right);
            checkNewCollider(plat.ObstacleWall_sides2.top, plat.ObstacleWall_sides2.bottom,
                    plat.ObstacleWall_sides2.left, plat.ObstacleWall_sides2.right);
            if(collider){
                collider.forEach((item)=>{
                    if(item.direction=="top"){
                        this.pos.y = item.top-this.size.h;
                        this.onGround = true;
                    }
                    else{
                        this.onGround = false;
                    }
                    if(item.direction=="bottom"){
                        if(this.pos.y+this.size.h>=htmlCanvas.width || this.onGround==true){
                            game.lose(this);
                        }
                        this.velocity.y = 0.5;
                        this.pos.y = item.bottom+1;
                    }
                    if(item.direction=="left"){
                        this.pos.x = item.left - this.size.w;
                        this.velocity.x = 0;
                    }
                    if(item.direction=="right"){
                        this.pos.x = item.right;
                        this.velocity.x = 0;
                    }
                })
            }
            //OBSTACLE COLLISION




            //SCORE COUNTING
            if(plat){
                if(this.pos.y+this.size.h<plat.pos.y && plat.scoreHolding==true){
                    plat.scoreHolding = false;
                    this.score += 1;
                }
            }
            
            i = i + 1;
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
        if((this.sides.bottom > htmlCanvas.height)){
            this.velocity.y = 0;
            //there might be a situation when player's part is "underground"
            this.pos.y = htmlCanvas.height - this.size.h;
            this.onGround = true;
        }
        //if colider is not active
        if((this.sides.bottom < htmlCanvas.height)&&!collider){
            this.onGround = false;
        }

        //SIDES switching
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
                //prevending the show of the lagged position of mirror, so the small mirror doesnt apears in wrong side
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
        if(this.moveable==true){
            if(pressedKeys[codes.w]==true){
                //he is acually jumping not flying up
                if(this.onGround==true){
                    //only when player hasn't reached vertical max speed
                    if(this.maxSpeed.vertical>this.velocity.y){
                        //resets velocity to provite new one
                        this.velocity.y = 0;

                        this.velocity.y -= this.speed.vertical;
                        this.onGround = false;
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
}
class Platform{
    constructor(){
        //platforms
        this.color = "black";
        this.nextPlatformGap = 200;
        this.childcreated = false;
        this.gapSize = 250;
        //gap position is center of the gap
        this.gapPos = randint(10, htmlCanvas.width-10);
        this.scoreHolding = true;
        this.velocity = {
            x: 0,
            y: 0.5
        }
        this.size = {
            w: htmlCanvas.width,
            h: 20
        }
        this.size2 = {
            w: htmlCanvas.width,
            h: 20
        }
        this.pos = {
            x: this.gapPos-this.gapSize/2 - this.size.w, 
            y: -30
        }
        this.pos2 = {
            x: this.gapPos+this.gapSize/2,
            y: -30
        }
        this.sides = {
            bottom: this.pos.y +this.size.h,
            top: this.pos.y,
            left: this.pos.x,
            right: this.pos.x + this.size.w
        }
        this.sides2 = {
            bottom: this.pos2.y +this.size2.h,
            top: this.pos2.y,
            left: this.pos2.x,
            right: this.pos2.x + this.size2.w
        }

        //Obstacles
        this.ObstacleWall = false; // two walls that block a way to "mirror"
        if(randint(1,1500)<500){
            this.ObstacleWall = true;
        }
        this.ObstacleWall_size = {
            h: this.nextPlatformGap+this.size.h,
            w: 10
        }
        this.ObstacleWall_size2 = {
            h: this.nextPlatformGap+this.size.h,
            w: 10
        }
        this.ObstacleWall_pos = {
            x: 0,
            y: this.pos.y-this.ObstacleWall_size.h
        }
        this.ObstacleWall_pos2 = {
            x: htmlCanvas.width-this.ObstacleWall_size.w,
            y: this.pos.y-this.ObstacleWall_size.h
        }
        this.ObstacleWall_sides = {
            bottom: this.ObstacleWall_pos.y + this.ObstacleWall_size.h,
            top: this.ObstacleWall_pos.y,
            left: this.ObstacleWall_pos.x,
            right: this.ObstacleWall_pos.x + this.ObstacleWall_size.w
        }
        this.ObstacleWall_sides2 = {
            bottom: this.ObstacleWall_pos2.y + this.ObstacleWall_size2.h,
            top: this.ObstacleWall_pos2.y,
            left: this.ObstacleWall_pos2.x,
            right: this.ObstacleWall_pos2.x + this.ObstacleWall_size2.w
        }
        this.ObstacleWall_color = "black";



        this.ObstacleSpikes = true; // spike chain on platform 
        this.ObstacleSpikesStreak = randint(0,4); //number of spikes in the chain
        //hitbox isnt fit in a visual spike
        //so variables in draw function have to be diffrent
        this.ObstacleSpikes_size = {        
            h: 20,
            w: 60*this.ObstacleSpikesStreak
        }
        //to be fixed (choose on what platform the spikes can spawn)
        if(htmlCanvas.width-this.gapPos+this.gapSize/2>this.ObstacleSpikes_size.w+100){
            this.ObstacleSpikesPlatform = 2;
        }
        else if(this.gapPos-this.gapSize/2>this.ObstacleSpikes_size.w+100){
            this.ObstacleSpikesPlatform = 1;
        }
        else{
            this.ObstacleSpikes = false;
        }
        console.log(this.ObstacleSpikesPlatform)
        //

        this.ObstacleSpikes_pos = {
            x: undefined,
            y: this.ObstacleSpikes_size.h + this.pos.y
        }
        this.ObstacleSpikes_sides = {
            bottom: this.ObstacleSpikes_pos.y + this.ObstacleSpikes_size.h,
            top: this.ObstacleSpikes_pos.y,
            left: this.ObstacleSpikes_pos.x,
            right: this.ObstacleSpikes_pos.x + this.ObstacleSpikes_size.w
        }
        this.ObstacleSpikes_color = "red";
        
    }
    draw(){
        //platforms 
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.w, this.size.h);
        ctx.fillRect(this.pos2.x, this.pos2.y,this.size2.w,this.size2.h);

        //obstacles
        if(this.ObstacleWall==true){
            ctx.fillStyle = this.ObstacleWall_color;
            ctx.fillRect(this.ObstacleWall_pos.x, this.ObstacleWall_pos.y,
            this.ObstacleWall_size.w, this.ObstacleWall_size.h);
            ctx.fillRect(this.ObstacleWall_pos2.x, this.ObstacleWall_pos2.y,
            this.ObstacleWall_size2.w, this.ObstacleWall_size2.h);
        }
        if(this.ObstacleSpikes = true){

        }

    }
    update(){
        //updating sides
        this.sides = {
            bottom: this.pos.y +this.size.h,
            top: this.pos.y,
            left: this.pos.x,
            right: this.pos.x + this.size.w
        }
        this.sides2 = {
            bottom: this.pos2.y +this.size2.h,
            top: this.pos2.y,
            left: this.pos2.x,
            right: this.pos2.x + this.size2.w
        }
        this.ObstacleWall_sides = {
            bottom: this.ObstacleWall_pos.y + this.ObstacleWall_size.h,
            top: this.ObstacleWall_pos.y,
            left: this.ObstacleWall_pos.x,
            right: this.ObstacleWall_pos.x + this.ObstacleWall_size.w
        }
        this.ObstacleWall_sides2 = {
            bottom: this.ObstacleWall_pos2.y + this.ObstacleWall_size2.h,
            top: this.ObstacleWall_pos2.y,
            left: this.ObstacleWall_pos2.x,
            right: this.ObstacleWall_pos2.x + this.ObstacleWall_size2.w
        }


        //platforms positions
        this.pos.y += this.velocity.y;
        this.pos.x += this.velocity.x;
        this.pos2.y += this.velocity.y;
        this.pos2.x += this.velocity.x;

        //obstacles positions
        if(this.ObstacleWall==true){
            this.ObstacleWall_pos = {
                x: 0,
                y: this.pos.y-this.ObstacleWall_size.h
            }
            this.ObstacleWall_pos2 = {
                x: htmlCanvas.width-this.ObstacleWall_size.w,
                y: this.pos.y-this.ObstacleWall_size.h
            }
        }


        if(this.pos.y>=this.nextPlatformGap){
            if(this.childcreated==false){
                game.platforms.push(new Platform()); 
                this.childcreated = true;
                game.platforms_counter += 1;
            }
        }
        if(this.pos.y>htmlCanvas.height+this.nextPlatformGap){
            game.platforms.shift();
        }

    }
}
//calling classes
//platforms.push(new Platform()); 
//const player = new Player();

//COLLISION
    //direction of colliding is assigned to ractange 1
/*function colliding(rac1Top, rac1Bottom, rac1Left, rac1Right, rac2Top, rac2Bottom, rac2Left, rac2Right){
    var ar = {
        isColliding: false,
        direction: "none",
        top: rac2Top,
        bottom: rac2Bottom,
        left: rac2Left,
        right: rac2Right
    };
    var sizeX = rac1Right - rac1Left;
    var sizeY = rac1Bottom - rac1Top;
    var size2X = rac2Right - rac2Left;
    var size2Y = rac2Bottom - rac2Top;
    if(rac1Bottom>rac2Top && rac1Top<rac2Bottom && rac1Left<rac2Right && rac1Right>rac2Left){
        ar.isColliding = true;
        var gapLeft, gapRight, gapTop, gapBottom;
        var attachedX = {direction:"none", diff: 0};
        var attachedY = {direction:"none", diff: 0};
        //check which direction is closer to be out of ractangle 2 and set the direction
        
        gapLeft = rac1Left - rac2Left;
        gapRight = rac2Right - rac1Right;
        gapTop = rac1Top - rac2Top;
        gapBottom = rac2Bottom - rac1Bottom;

        //X
        if(gapRight>gapLeft){attachedX.direction = "left"; attachedX.diff = rac1Right-rac2Left;}
        if(gapRight<gapLeft){attachedX.direction = "right"; attachedX.diff = rac2Right-rac1Left;}
        if(gapRight==gapLeft){attachedX.direction = "centered";} 
        
        //Y
        if(gapTop>gapBottom){attachedY.direction = "bottom"; attachedY.diff = rac2Bottom-rac1Top;}
        if(gapTop<gapBottom){attachedY.direction = "top"; attachedY.diff = rac1Bottom - rac2Top;}
        if(gapTop==gapBottom){attachedY.direction = "centered"; attachedY.diff = 0.1;} 

        //final direction choosing
        if(attachedX.diff<attachedY.diff){
            ar.direction = attachedX.direction;
        }
        else if(attachedX.diff>attachedY.diff){
            ar.direction = attachedY.direction;
        }
        else{
            console.log("How did we get here?");
        }

    }   

    return ar;
}*/

//GAME FUNCTIONS
/*
function update(){

    player.update();

    var i = 0
    while(i<platforms.length){
        platforms[i].update()
        i++;
    }

}
function redraw() {
    ctx.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
    ctx.beginPath();

    player.draw();

    var i = 0
    while(i<platforms.length){
        platforms[i].draw()
        i++;
    }
    
    ctx.stroke();
}



//Game loop function
loop = function(){
    setTimeout(()=>{
        update();
        redraw();
        loop();
    },5)
}
*/

//Lose function
//activates when player should die
function lose(player){
    console.log("lose")
}

//Triangle function for obstacles
function drawTriangle(posX, posY, sizeH, sizeW) {
    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.lineTo(posX-sizeW/2, posY+sizeH);
    ctx.lineTo(posX+sizeW/2, posY+sizeH);
    ctx.fill();
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


//loop();
game = new Game();
game.run();
