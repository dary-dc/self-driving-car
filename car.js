class Car{
    constructor(x,y,width,height,controlType,maxSpeed=3){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        // we don't want to have a car with RUM (moviminento rectilineo uniforme)
        this.speed=0; // initially determined to zero
        this.acceleration=0.2; // acceleration tha will modify the car speed with the keyboard listeners
        this.maxSpeed=maxSpeed; // with the above code only the car can get to move too fast (since the speed can accumulate as much as we want)
        this.friction=0.05; // thus will stop the car spontaneously, making it to return to the rest state if not ordered otherwise
        this.angle=0 // angle that we will use for turning the car
        this.damaged=false

        // in order to simulate colisions we need to give the car a polygonal form
        this.polygon=[]

        if(controlType!="TRAFFIC"){
            this.sensor=new Sensor(this); // we pass the car as argument of the sensor to use some car properties, such as position
            
            // to interact with the brain manually it will be needed that when we use controlType="KEYS" the car also creates a brain
            this.brain=new NeuralNetwork(
                [this.sensor.rayCount, // number of neurons in the first layer/level
                6, // number in the hidden layer
                4] // ... in the output for the controls arrow keeys
            );
        }

        this.useBrain=controlType=="AI";

        this.controls=new Controls(controlType);
    }

    // This method WON'T WORK without calling the function 
    // We call it inside the 'animate()' function in main.js
    update(roadBorders,traffic){
        if(!this.damaged){ //this is what makes the car useless when a collision is detected
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map( // for transforming the 'null' type to 0
                reading=>reading==null?0:1-reading.offset // for every offset (intersection proportion) in the sensor reading if the sensor reading == null, then return 0 (the sensor didn't read anything), otherwise we get its reading
            ); // since the offset will be between 0 and 1 we substract 1 - offset to obtain simulate the value that a real sensor will recieve, since they (or at least some of them) work with its own lights and the amount of reflection that they percieve from the direction of its light is what they interpret to know about the distance of the nearest objects. (the amount of reflection can also be an indicator of the type of matter of the object???)
            
            const outputs=NeuralNetwork.produceFinalOutput(offsets,this.brain)
            
            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.backward=outputs[3];
            }
        }
    }

    draw(ctx,color,drawSensors=false){
        if(this.damaged){
            ctx.fillStyle="gray";
        }else{
            ctx.fillStyle=color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
        for(let i=1;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();

        if(this.sensor && drawSensors){
            this.sensor.drawRays(ctx); // make the car itself draw its sensor
        }
    }

    // method for allowing the car class to interpret the controls
    // and for simulating normal car functioning and basic physics
    #move(){
        // accelerate: forward
        if(this.controls.forward){
            this.speed+=this.acceleration;
        } // backward
        if(this.controls.backward){
            this.speed-=this.acceleration;
        }

        // setting the speed limit
        if(this.speed>this.maxSpeed){ // set the limit for the speed forward
            this.speed=this.maxSpeed;
        }
        if(this.speed<-(this.maxSpeed/2)){ // set the limit for the speed backward
            this.speed=-this.maxSpeed/2;
        }

        // introducing the friction
        if(this.speed>0){ // the positive speed (car moving upwards) will have negative friction (decrementing the y axis will slow down car's speed untill zero)
            this.speed-=this.friction
        }
        if(this.speed<0){ // opposite
            this.speed+=this.friction
        }
        if(Math.abs(this.speed)<this.friction){ // since we are always substracting the friction (0.05) if the last value of the car is 0.04 then the velocity becomes negative and the car keep moving forward by 0.05, since the second if statement regarding to the friction will have a true condition (speed will be < zero)
            this.speed=0;
        }
    
        // turning the direction with left and right bottons
        if(this.speed!=0){
            if(this.controls.left){
                this.angle+=0.03; 
            }
            if(this.controls.right){
                this.angle-=0.03;
            }
        }

        // executing the coordinates
        this.x-=Math.sin(this.angle)*this.speed; // remember: instead of the traditional trigonometric circle, our is rotated 90 degrees counter-clockwise (so the car starting angle is 0 degrees, intead of 90)
        this.y-=Math.cos(this.angle)*this.speed;
    }

    // find the coordinates of the corners of the car to use them in the getIntersection function to detect collisions
    // if the car is simply with an angle 0 of degrees, the corners of the car will be at coordinates: {x:, y:} for the upper-left, {x:this.car, y:} for the upper-right, 
    #createPolygon(){
        const points=[]; // corners
        const radious=Math.hypot(this.width, this.height)/2; // distance from the center of the car to any of the corners
        const cornerAngle=Math.atan2(this.width, this.height); // arctan(y)=x, the angle between one of the upper two radious and the line that goes from the center of the car to the center of the front of the car
        points.push({
            x:this.x-Math.sin(this.angle-cornerAngle)*radious, // car x coordinates - co formado por el nuevo trianglulo rect si desplazaramos el 
            y:this.y-Math.cos(this.angle-cornerAngle)*radious
        });
        points.push({
            x:this.x-Math.sin(this.angle+cornerAngle)*radious,
            y:this.y-Math.cos(this.angle+cornerAngle)*radious
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-cornerAngle)*radious,
            y:this.y-Math.cos(Math.PI+this.angle-cornerAngle)*radious
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+cornerAngle)*radious,
            y:this.y-Math.cos(Math.PI+this.angle+cornerAngle)*radious
        });
        return points;
    }

    #assessDamage(roadBorders,traffic){
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for(let j=0;j<traffic.length;j++){
            if(polysIntersect(this.polygon,traffic[j].polygon)){
                return true;
            }
        }
        return false;
    }
}