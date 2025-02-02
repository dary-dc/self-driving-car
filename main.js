const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=500;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");


const laneCount = 3
const road=new Road(carCanvas.width/2,carCanvas.width*0.9,laneCount);
// store the centers of all the lanes
const laneCenters=[]
for(let i=0;i<laneCount;i++){
    laneCenters.push(road.getLaneCenter(i))
}

const N=100;
const cars=generateCars(N);
let bestCar=cars[0]; // we need to declare the best car as a global variable since we need to access it from the save and discard functions and we don't want those functions to be inside our animate function. Also although we initialize the best car as the first car we will actualize it in every frame by finding the car that best fits the optimization function, so it's not a problem. Finally, we use let for changing variables not built-in objects???.

// if we have already a best car brain stored
if(localStorage.getItem("bestBrain")){
    // make all the new cars instances have the best car brain
    for(let i=0;i<cars.length;i++){
        cars[i].brain= JSON.parse(// local storage only works with strings
                                    localStorage.getItem("bestBrain"));
        if(i!=0){ // not to mutate the first car (we want to left at least one brain equal to the previous one)
            
            // try out by yourself different mutations here!!!
            NeuralNetwork.mutate(cars[i].brain,0.05)
            // NeuralNetwork.mutate(cars[i].brain,0.10)
        }
    }
// otherwise we create all car from scratch
}

// you can modify these obstacles created by hand, 
// or even better, create an algorithm for setting obstacles
// randomly
const traffic=[
    new Car(laneCenters[1],-100,30,50,"TRAFFIC",2),
    
    new Car(laneCenters[0],-200,30,50,"TRAFFIC",2),
    new Car(laneCenters[2],-200,30,50,"TRAFFIC",2),
    
    new Car(laneCenters[1],-300,30,50,"TRAFFIC",2),

    new Car(laneCenters[0],-400,30,50,"TRAFFIC",2),
    new Car(laneCenters[2],-400,30,50,"TRAFFIC",2),
    
    new Car(laneCenters[1],-500,30,50,"TRAFFIC",2),
    new Car(laneCenters[2],-500,30,50,"TRAFFIC",2),
    
    new Car(laneCenters[0],-700,30,50,"TRAFFIC",2),
    new Car(laneCenters[1],-700,30,50,"TRAFFIC",2),

    new Car(laneCenters[1],-900,30,50,"TRAFFIC",2),
    new Car(laneCenters[2],-900,30,50,"TRAFFIC",2),
    
    new Car(laneCenters[0],-1100,30,50,"TRAFFIC",2),
    new Car(laneCenters[1],-1100,30,50,"TRAFFIC",2)
]

animate();

// we need to save the best car brain
function save(){
    localStorage.setItem("bestBrain", // name of the file for storage
        JSON.stringify(bestCar.brain)); // what we are going to store
}

// but also we need to discard it and replace it
function discard(){
    localStorage.removeItem("bestBrain");
}

// generate cars for apply genetic algorithms
function generateCars(N){
    const cars=[]
    for(let i=0;i<N;i++){
        cars.push(new Car(laneCenters[1],100,30,50,"AI"));
        console.log("cars[i].brain.levels.biases",cars[i].brain.levels.biases,
                    "cars[i].brain.levels.weights",cars[i].brain.levels.weights)
    }
    return cars;
}

function animate(time){ // this is a parameter that request frame animation had implicitly
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]); // the cars of the traffic be damaged by the roadboarders, but not by themselves (or us) since we don't want a bunch of cars damaged in front of us if something doesn't goes ok with thier behaviour 
    }

    for(let i=0;i<N;i++){
        cars[i].update(road.borders,traffic); // arguments are the intersections that damage our car
    }

    // optimization: fitness functions
    // function number 1: we want to focus on the car with the minimum y value
    bestCar=cars.find( // find in the cars array
        c=>c.y==Math.min( // the car with the minimum value
            ...cars.map(c=>c.y) // of all the cars y value attribute (this line creates a new array with all the cars y values, and then the three dots (...) spread its values, bcuz the Math.min() function doesn't work for arrays, it needs the values as arguments)
        ));

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight; 

    carCtx.save(); // this will save the car instantiations rays and others
    // this is basically moving the canvas with its modifications (the road) towards the car
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx); // draw it first to see the car over

    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,"red");
    }

    carCtx.globalAlpha=0.2; // for drawing the cars more transparent, so we can see better what's happening and the best one
    for(let i=1;i<N;i++){
        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha=1; // back to one, so it doesn't affect the best car
    
    // draw the first car with the original color
    bestCar.draw(carCtx,"blue",true); // and with the sensors
    
    carCtx.restore(); 

    networkCtx.lineDashOffset=-time/50; // this is what makes the line of the network to be dashed
    Visualizer.drawNetwork(networkCtx,bestCar.brain,bestCar.sensor.readings);

    // the following function calls the function repeatedly and with high frequency, but the car actually doesn't changes its position without it
    requestAnimationFrame(animate);
}