class Sensor{
    constructor(car){ // we will take the our car object instantiation as argument since we will use some if its features
        this.car=car;
        this.rayCount=7; // number of rays
        this.rayLength=250;
        this.raySpread=Math.PI/2; // the angle through which we will spread all the rays 

        // // create a physical sensor
        // this.width=8
        // this.height=8

        // sensor coordinates. Dependent of the car's coordinates (the center), but not the same (the sensor is in the front of the car)
        this.sensorCoordinates = this.#getSensorOrigin(this.car.x, this.car.y, this.car.carAngle)

        // store the rays to easily access to them
        this.rays=[];

        // in readings we will have a value for each ray describing the proximity of each border
        this.readings=[];
    }

    update(roadBorders,traffic){
        this.sensorCoordinates = this.#getSensorOrigin(this.car.x, this.car.y, this.car.angle, this.car.height)
        
        this.#castRays(); // this will make the rays start functioning
        this.readings=[]; // this will store the readings to interpret them with another function
        for(let i=0;i<this.rayCount;i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic
                )
            );
        }
    }

    // dynamic positioning of the sensor with regard to the car position
    #getSensorOrigin(carX, carY, carAngle, carHeight){
        const offsetX = Math.sin(carAngle) * carHeight/2;
        const offsetY = Math.cos(carAngle) * carHeight/2;
        // console.log(offsetX, offsetY) // for debuging
        return{
            x: carX - offsetX, // remember: instead of the traditional trigonometric circle, our is rotated 90 degrees counter-clockwise (so the car starting angle is 0 degrees, intead of 90)
            y: carY - offsetY
        };
    }

    #castRays(){
        this.rays=[] // don't know why: create the rays inside the function
        // create the angles of the rays from left (zero angle) to right
        for(let i=0;i<this.rayCount;i++){
            const rayAngle=lerp(
                this.raySpread/2, // start of the interpolation 
                -this.raySpread/2, // end
                this.rayCount==1?0.5:i/(this.rayCount-1) // step: the maximun value of 'i' is 'this.rayCount' 
            )+this.car.angle; // if the car rotate, then the ray needs to rotate along with it
            
            // define the position of the rays with two points: start(x,y) and end(x,y)
            const startRay={x:this.sensorCoordinates.x, y:this.sensorCoordinates.y}; // the rays start in the front of the car
            const endRay={ // explaination in photo 1/27 (Jan, 27)
                x:this.sensorCoordinates.x - Math.sin(rayAngle) * this.rayLength, // remember: instead of the traditional trigonometric circle, our is rotated 90 degrees counter-clockwise (so the car starting angle is 0 degrees, intead of 90)
                y:this.sensorCoordinates.y - Math.cos(rayAngle) * this.rayLength
            }; // points found with linear interpolation (lerp function)

            this.rays.push([startRay, endRay]); // for each ray we store its start and end coordinates
        }
    }

    #getReading(ray,roadBorders,traffic){
        let touches=[]; // all the points that touches every ray

        for(let i=0;i<roadBorders.length;i++){
            const touch=getIntersectionAndProportion( // a fuction from 'utils.js'. The order in which we pass the argument DOES count, since the function will find the intercept but also the offset of the segment defined in the two first arguments.
                ray[0], // startRay
                ray[1], // endRay
                roadBorders[i][0], // top
                roadBorders[i][1]  // bottom
            );
            if(touch){ // if there isn't intersect, nothing is added
                touches.push(touch)
            }
        }

        for(let i=0;i<traffic.length;i++){ // for each car in the traffic
            const poly=traffic[i].polygon;
            for(let j=0;j<poly.length;j++){ // for each point in the car polygon (four vertices in the caar polygon, and also four sides)
                // console.log("ray 0 1",ray[0],ray[1],"poly i j",poly[j],poly[j+1])
                const value=getIntersectionAndProportion(
                    ray[0], // startRay
                    ray[1], // endRay
                    poly[j], // top
                    poly[(j+1)%poly.length]  // bottom
                );
                if(value){
                    touches.push(value);
                }
            }
        }        

        if(touches.length==0){ // if there isn't itersection between a ray and a border
            return null; // we simply make the reading 'null'
        
        // since the 'getIntersection' function returns three things: x and y coordinates and also the offset
        }else{ // (offset: a proportion related to the distance from ray[0]/startRay/theCenterOfTheCar to the closest touch)
            const offsets=touches.map(element=>element.offset) // array 'map' method: go through all the elements in 'touches' array, and for each element it takes its offset and stores it inside the new 'offsets' array
            const minOffset=Math.min(...offsets) // but we the closest obstacle is enough to determine an obstacle
            return touches.find(element=>element.offset==minOffset); // This makes sense: we find the minimun offset which will indicate the intersection point and then we look for them in the array, but... is this needed? we already found 'minOffset', couldn't we just return them?
        }
    }

    drawRays(ctx){
        for(let i=0;i<this.rayCount;i++){ // for each ray
            // use the reading endpoint of the rays if there's intersection
            let end=this.rays[i][1]; // get endRay
            if(this.readings[i]){ // but if there's an intersection between a ray and an object
                end=this.readings[i]; // set 'end' as the point of intersection
            }

            // draw the rays till the intersection
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="yellow";
            ctx.moveTo( // from the center of the car or startRay
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo( // to the intersections
                end.x,
                end.y
            );   
            ctx.stroke();

            // draw the intersection in other color
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo( // from endRays
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo( // to the intersections
                end.x,
                end.y
            );   
            ctx.stroke();
        }
    }
}