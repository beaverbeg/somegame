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
pressedKeys = {}

//CLASS
class Game{
    constructor(){
        this.running = true;
        this.platforms = [];
        this.player;
        this.platforms_counter;
        //how fast will platforms move (2 = x2, 5 = x5 faster)
        this.speed = 1; 
        this.maxspeed = 2.5;
        this.lava = false;
        this.backgroundColor = "#D9D9D9"
    }
    update(){
        if(this.speed<this.maxspeed){
            this.speed += 0.00004;
        }
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
        
        //background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, htmlCanvas.width, htmlCanvas.height);

        this.player.draw();

        var i = 0
        while(i<this.platforms.length){
            this.platforms[i].draw()
            i++;
        }
        if(this.lava==true){
            ctx.fillStyle = "red";
            ctx.fillRect(0, htmlCanvas.height-5, htmlCanvas.width, 5)
        }
    
        ctx.stroke();
    }
    stop(){
        //when game is stopped all classes and variables are still the same
        //so if the new game will start they need to be reseted
        this.running = false;
    }
    lose(reason){
        console.log("lose: "+reason);
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
        this.onGround = false;
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

        //COLLISION
        var collider = [];
        //platform collision and score counter
        var i = 0
        while(i<game.platforms.length){
            if(this.clip==false) return;
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
            checkNewCollider(plat.left.sides.top,plat.left.sides.bottom,plat.left.sides.left,plat.left.sides.right);
            checkNewCollider(plat.right.sides.top,plat.right.sides.bottom,plat.right.sides.left,plat.right.sides.right)
            //wall obstacles
            checkNewCollider(plat.obstacle.wall.left.sides.top, plat.obstacle.wall.left.sides.bottom,
                plat.obstacle.wall.left.sides.left, plat.obstacle.wall.left.sides.right);
            checkNewCollider(plat.obstacle.wall.right.sides.top, plat.obstacle.wall.right.sides.bottom,
                    plat.obstacle.wall.right.sides.left, plat.obstacle.wall.right.sides.right);
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
                        //if there is no "-this.size.h/10" you can hold jump and than pass through a platform
                        if(this.sides.bottom>htmlCanvas.height-this.size.h/10 || this.onGround==true){
                            game.lose("The player got crashed");
                        }
                        //WHEN THERE IS HIGH GAME SPEED YOU CAN ATACH TO TOP OF PLATFORM (TO BE FIXED)
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
            //making new colliders (obstacle)
            //HOW LOSE REASON GONNA WORK HERE MF
            collider = [];
            checkNewCollider(plat.obstacle.spike.sides.top, plat.obstacle.spike.sides.bottom,
                plat.obstacle.spike.sides.left, plat.obstacle.spike.sides.right)

            if(collider){
                collider.forEach((item)=>{
                    
                })
            }




            //SCORE COUNTING
            if(plat){
                if(this.pos.y+this.size.h<plat.left.pos.y && plat.right.pos.y && plat.scoreHolding==true){
                    plat.scoreHolding = false;
                    this.score += 1;
                    game.lava = true;
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
            //change later (spagheti)
            if(game.lava==true){
                game.lose("Player burned in lava.");
            }
            
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
        //PLATFORMS
        //global variables for platforms
        this.color = "black";
        this.nextPlatformGap = 170;
        this.childcreated = false;
        this.gapSize = 250;
        //gap position is center of the gap
        this.gapPos = randint(10, htmlCanvas.width-10);
        this.scoreHolding = true;
        this.velocity = {
            x: 0,
            y: 0.5
        }
        this.suitable_min = 301 //minimum requiared free space on platform with spikes
        //seperate variables for platforms
        //MAN WTF IS THIS
        this.left = {
            size:{w:undefined,h:undefined},
            pos:{x:undefined,y:undefined},
            sides:{bottom:undefined,top:undefined,left:undefined,right:undefined},
            size_on_screen:{w:undefined,h:undefined},
            suitable:undefined
        }
        this.right = {
            size: {w:undefined,h:undefined},
            pos: {x:undefined,y:undefined},
            sides: {bottom:undefined,top:undefined,left:undefined,right:undefined},
            size_on_screen:{w:undefined,h:undefined},
            suitable:undefined
        }
        this.left.size.w = htmlCanvas.width;
        this.left.size.h = 20;
        this.left.pos.x = this.gapPos-this.gapSize/2 - this.left.size.w;
        this.left.pos.y = -30;
        this.left.sides.bottom = this.left.pos.y +this.left.size.h;
        this.left.sides.top = this.left.pos.y;
        this.left.sides.left = this.left.pos.x;
        this.left.sides.right = this.left.pos.x + this.left.size.w;
        this.left.size_on_screen.w = this.gapPos - this.gapSize/2;
        this.left.size_on_screen.h = this.left.size.h;
        this.left.suitable = Boolean;

        this.right.size.w = htmlCanvas.width;
        this.right.size.h = 20;
        this.right.pos.x = this.gapPos+this.gapSize/2;
        this.right.pos.y = -30;
        this.right.sides.bottom = this.right.pos.y +this.right.size.h;
        this.right.sides.top = this.right.pos.y;
        this.right.sides.left = this.right.pos.x;
        this.right.sides.right = this.right.pos.x + this.right.size.w;
        this.right.size_on_screen.w = htmlCanvas.width - this.right.pos.x;
        this.right.size_on_screen.h = this.right.size.h;
        this.right.suitable = Boolean;
        


        //Obstacles
        this.obstacle = {
            wall:{
                is:undefined,
                color:undefined,
                left:{
                    size:{h:undefined,w:undefined},
                    pos:{x:undefined,y:undefined},
                    sides:{bottom:undefined,top:undefined,left:undefined,right:undefined}
                },
                right:{
                    size:{h:undefined,w:undefined},
                    pos:{x:undefined,y:undefined},
                    sides:{bottom:undefined,top:undefined,left:undefined,right:undefined}
                }
                

            },  
            spike:{
                is:undefined,
                color:undefined,
                streak:undefined,
                size:{h:undefined,w:undefined},
                pos:{x:undefined,y:undefined},
                sides:{bottom:undefined,top:undefined,left:undefined,right:undefined}
            }
        }
        this.obstacle.wall.is = false;
        this.obstacle.wall.color = "black";

        this.obstacle.wall.left.size.h = this.nextPlatformGap+this.left.size.h;
        this.obstacle.wall.left.size.w = 10;
        this.obstacle.wall.left.pos.x = 0;
        this.obstacle.wall.left.pos.y = this.left.pos.y-this.obstacle.wall.left.size.h;
        this.obstacle.wall.left.sides.bottom = this.obstacle.wall.left.pos.y + this.obstacle.wall.left.size.h;
        this.obstacle.wall.left.sides.top = this.obstacle.wall.left.pos.y;
        this.obstacle.wall.left.sides.left = this.obstacle.wall.left.pos.x;
        this.obstacle.wall.left.sides.right = this.obstacle.wall.left.pos.x + this.obstacle.wall.left.size.w;

        this.obstacle.wall.right.size.h = this.nextPlatformGap+this.left.size.h;
        this.obstacle.wall.right.size.w = 10;
        this.obstacle.wall.right.pos.x = htmlCanvas.width-this.obstacle.wall.left.size.w;
        this.obstacle.wall.right.pos.y = this.left.pos.y-this.obstacle.wall.left.size.h;
        this.obstacle.wall.right.sides.bottom = this.obstacle.wall.right.pos.y + this.obstacle.wall.right.size.h;
        this.obstacle.wall.right.sides.top = this.obstacle.wall.right.pos.y;
        this.obstacle.wall.right.sides.left =  this.obstacle.wall.right.pos.x;
        this.obstacle.wall.right.sides.right = this.obstacle.wall.right.pos.x + this.obstacle.wall.right.size.w;


        this.obstacle.spike.is = true; // spike chain on platform 
        this.obstacle.spike.color = "red";
        this.obstacle.spike.streak = randint(0,4); //number of spikes in the chain
        //hitbox isnt fit in a visual spike
        //so variables in draw function have to be diffrent
        this.obstacle.spike.size.h = 20;
        this.obstacle.spike.size.w = 60*this.obstacle.spike.streak;
        this.obstacle.spike.pos.x = undefined;
        this.obstacle.spike.pos.y = this.left.pos.y-this.obstacle.spike.size.h;
        this.obstacle.spike.bottom = this.obstacle.spike.pos.y + this.obstacle.spike.size.h;
        this.obstacle.spike.top = this.obstacle.spike.pos.y;
        this.obstacle.spike.left = this.obstacle.spike.pos.x;
        this.obstacle.spike.right = this.obstacle.spike.pos.x + this.obstacle.spike.size.w;


        //LOGICAL
        //wall
        if(randint(1,1500)<500){
            this.obstacle.wall.is = true;
        }

        //spike
        if(this.left.size_on_screen.w>this.obstacle.spike.size.w+this.suitable_min){this.left.suitable = true;}
        else{this.left.suitable = false;}
        if(this.right.size_on_screen.w>this.obstacle.spike.size.w+this.suitable_min){this.right.suitable = true;}
        else{this.right.suitable = false;}
        //spike x position
        if(this.left.suitable==false && this.right.suitable==false){this.obstacle.spike.is=false;}
        if(this.obstacle.spike.is){
            if(this.left.suitable&&this.right.suitable == true){
                if(randint(1,2)==1){this.right.suitable=false}
                else{this.left.suitable=false}
            }
            if(this.left.suitable){
                this.obstacle.spike.pos.x = randint(1, this.left.size_on_screen.w - this.suitable_min/2)
            }   
            if(this.right.suitable){
                this.obstacle.spike.pos.x = randint(this.obstacle.spike.pos.x+this.suitable_min_min/2, htmlCanvas.width)
            }
        }
        

    }
    draw(){
        //platforms 
        ctx.fillStyle = this.color;
        ctx.fillRect(this.left.pos.x, this.left.pos.y, this.left.size.w, this.left.size.h);
        ctx.fillRect(this.right.pos.x, this.right.pos.y,this.right.size.w,this.right.size.h);

        //obstacles
        if(this.obstacle.wall.is==true){
            ctx.fillStyle = this.obstacle.wall.color;
            ctx.fillRect(this.obstacle.wall.left.pos.x, this.obstacle.wall.left.pos.y,
            this.obstacle.wall.left.size.w, this.obstacle.wall.left.size.h);
            ctx.fillRect(this.obstacle.wall.right.pos.x, this.obstacle.wall.right.pos.y,
            this.obstacle.wall.right.size.w, this.obstacle.wall.right.size.h);
        }
        if(this.obstacle.spike.is = true){
            //for(var i=1;i<this.obstacle.spike.streak+1;i++){
                ctx.fillStyle = this.obstacle.spike.color;
                ctx.fillRect(this.obstacle.spike.pos.x, this.obstacle.spike.pos.y, this.obstacle.spike.size.w,
                    this.obstacle.spike.size.h);
            //}
        }

    }
    update(){
        //obstacles
        if(this.obstacle.wall.is==true){
            //pos
            this.obstacle.wall.left.pos.x = 0;
            this.obstacle.wall.left.pos.y = this.left.pos.y-this.obstacle.wall.left.size.h; 
            this.obstacle.wall.right.pos.x = htmlCanvas.width-this.obstacle.wall.left.size.w;
            this.obstacle.wall.right.pos.y = this.left.pos.y-this.obstacle.wall.left.size.h;

            //sides
            this.obstacle.wall.left.sides.bottom = this.obstacle.wall.left.pos.y + this.obstacle.wall.left.size.h;
            this.obstacle.wall.left.sides.top = this.obstacle.wall.left.pos.y;
            this.obstacle.wall.left.sides.left = this.obstacle.wall.left.pos.x;
            this.obstacle.wall.left.sides.right = this.obstacle.wall.left.pos.x + this.obstacle.wall.left.size.w;
    
            this.obstacle.wall.right.sides.bottom = this.obstacle.wall.right.pos.y + this.obstacle.wall.right.size.h;
            this.obstacle.wall.right.sides.top = this.obstacle.wall.right.pos.y;
            this.obstacle.wall.right.sides.left =  this.obstacle.wall.right.pos.x;
            this.obstacle.wall.right.sides.right = this.obstacle.wall.right.pos.x + this.obstacle.wall.right.size.w;
        }
        if(this.obstacle.spike.is==true){
            //pos
            this.obstacle.spike.pos.y = this.left.pos.y-this.obstacle.spike.size.h;

            //sides
            this.obstacle.spike.bottom = this.obstacle.spike.pos.y + this.obstacle.spike.size.h;
            this.obstacle.spike.top = this.obstacle.spike.pos.y;
            this.obstacle.spike.left = this.obstacle.spike.pos.x;
            this.obstacle.spike.right = this.obstacle.spike.pos.x + this.obstacle.spike.size.w;
        }



        //platform
        this.left.sides.bottom = this.left.pos.y +this.left.size.h;
        this.left.sides.top = this.left.pos.y;
        this.left.sides.left = this.left.pos.x;
        this.left.sides.right = this.left.pos.x + this.left.size.w;

        this.right.sides.bottom = this.right.pos.y +this.right.size.h;
        this.right.sides.top = this.right.pos.y;
        this.right.sides.left = this.right.pos.x;
        this.right.sides.right = this.right.pos.x + this.right.size.w;



        this.left.pos.y += this.velocity.y*game.speed;
        this.left.pos.x += this.velocity.x*game.speed;
        this.right.pos.y += this.velocity.y*game.speed;
        this.right.pos.x += this.velocity.x*game.speed;

        if(this.left.pos.y && this.right.pos.y>=this.nextPlatformGap){
            if(this.childcreated==false){
                game.platforms.push(new Platform()); 
                this.childcreated = true;
                game.platforms_counter += 1;
            }
        }
        if(this.left.pos.y && this.right.pos.y>htmlCanvas.height+this.nextPlatformGap){
            game.platforms.shift();
        }

    }
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
