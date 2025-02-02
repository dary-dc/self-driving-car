
// the level class have almost all the needed to compute the value of each neuron
// now we are going to make the implementation easy and organized
class NeuralNetwork{
    constructor(neuronCounts){ // neuronCounts is an array with arrays (length of these second array is the number of levels) with the number of neuron IN EACH LAYER/LEVEL
        this.levels=[];
        for(let i=0;i<neuronCounts.length-1;i++){ // for each level
            this.levels.push(new Level( // initialize and store the levels of the network
                neuronCounts[i],neuronCounts[i+1]));
        }
        
    }

    static produceFinalOutput(givenInputs,network){
        let outputs=Level.feedNextLevel( // produce output in thhe first level
            givenInputs,network.levels[0]);
        for(let i=1;i<network.levels.length;i++){ // for each of the remaining levels
            outputs=Level.feedNextLevel(
                outputs,network.levels[i]);
        }
        return outputs; // final output
    }

    static mutate(network,amount=1){

        for(let i=0;i<network.levels.length;i++){
            
            let level = network.levels[i]

            // if it's needed a lower level of variation of weigts and biases than totally random ones
            if(amount!=1){

                // create and store inside an array all the possible indexes of each weight
                // total number of weights in a level (one weight for connection)
                const totalWeights = level.inputs.length*level.outputs.length;

                // create an array to store the weights indexes
                let weightsIndexes=[] // new Array(totalWeights);

                // store the indexes
                for(let i=0;i<totalWeights;i++){
                    weightsIndexes.push(i)
                };

                // compute the amount of variation we want for the weights by multipliying the number of weights in the level by 'variation' (a number between 0 and 1)
                // weight variation counter
                const weightsVarCounter=Math.floor(amount*totalWeights);

                // obtain the Random Unique weights Indexes and use them to vary the weights at those indexes
                for(let i=0;i<weightsVarCounter;i++){
                    const randomIndex=getRandomUniqueElementFrom(weightsIndexes); // get the index (between 0 and totalWeights - 1)

                    // since level.outputs.length represents the number of weights that we have in each array inside the leve.weights array (see Level contructor, this.weights), we divide by level.outputs.length to obtain the array where we want the variation to occur
                    const inputNeuron=Math.floor(randomIndex/level.outputs.length);

                    // and the modulo (the remainig) of that same division will provide us the index of the weight inside the array we determined previously
                    const outputNeuron=randomIndex%level.outputs.length;

                    level.weights[inputNeuron][outputNeuron]=Math.random()*2-1;
                };

                // then, make the biases vary
                const totalBiases = level.outputs.length; // or level.biases.length

                // create an array to store the indexes
                let biasesIndexes=[] // new Array(totalBiases);

                // store the indexes
                for(let i=0;i<totalBiases;i++){
                    biasesIndexes.push(i)
                };

                // compute the amount (in percent) of variation we want for each level in the biases, which is the activation threshold
                // biases variation counter
                const biasesVarCounter=Math.floor(amount*totalBiases);

                // obtain the random unique biases indexes and use them to cause the variation
                for(let i=0;i<biasesVarCounter;i++){
                    const randomIndex=getRandomUniqueElementFrom(biasesIndexes);
                    level.biases[randomIndex]=Math.random()*2-1
                };
            
            // otherwise, if we want all the weight and biases to vary completely, simply create the network entirely from scratch
            }else{

                console.log("amount 1")
                // a pseudorandom generated weights and biases, specially useful for the beginnig
                Level.randomize(level);
            }
        }
    }
}


// activation of a single neuron of the next layer is determined by
// the weighted sum of each activation of the neurons in the current layer
// minus the bias. From then the technique varies according to the needs.
// It is common to use that reault reduced/squished to the interval [0,1] 
// with a function like the sigmoid, hypebolic tangent, ReLU ..., resulting in something like
// a[l] = ReLU(w[1]*a[1] + w[2]*a[2] + ... + w[n]*a[n]).
// This formula is basically a hyperplane equation, which has one of its main characteristic
// that it separates space into two parts. Is equation is given by the formula:

//      matrix (weights) * vector (sensor/neuron values) + biases = 0
// [ [w[0][0] ... w[0][n]],       [s[0]]      [b[0]]
//      [... ... ...]         *    [...]  +   [...]   =  0
//   [w[k][0] ... w[k][n]] ]      [s[n]]      [b[k]]
// this can actually be reduced insanely to the line equation by removing dimensions

// However in this case we will simply use the bias value as the activation function, i.e.
// to determine whether the neuron is active or inactive.
// Mathematically we will be using a function like this one:
// f(x) = { 0 if x <= bias
//        { 1 if x > bias
// (geometrically is a discontinuous function at the value of the bias
// with a tangent line of zero where it its defined, and derivable).


class Level{ // neuron level (one input and one ouput layer) class
    constructor(inputCount,outputCount){ // its arguments will be all the inputs and outputs of a layer, i.e. firstly the raw data and its transformation, then that last transformation as input and the transofrmation of the hidden layer as output, and lastly that result will be translated to the control of our car.
        // each level has one of the following:
        this.inputs=new Array(inputCount);
        this.outputs=new Array(outputCount);
        this.biases=new Array(outputCount); // value above which each neuron will be fired/activated (one for each neuron in the current level/layer)

        // each output neuron from each layer has one of the following:
        this.weights=[]; // value that will multiply each current neuron value
        for(let i=0;i<inputCount;i++){ // each output neuron will have a weight
            this.weights[i]=new Array(outputCount);
        }

        Level.randomize(this)
    }

    // we create an static one bcuz we are going to serialize (create various objects???) the object level afterwards
    // we don't want to make this an specific method for each layer/level, we want instead to have a method that
    // we can simply apply to any level
    static randomize(level){ // variation is a number between 0 and 1
        
        // create a pseudorandom weight for each connection (level.numberOfConnections = level.inputs.length*level.outputs.length)
        for(let i=0;i<level.inputs.length;i++){ // for each connection (between input and output neurons)
            for(let j=0;j<level.outputs.length;j++){
                level.weights[i][j]=Math.random()*2-1; // pseudorandom number between 0 and 1, multiplied by the range of the interval, plus the middle number of the interval where you want the random number
                // we can use negative values for the weights, since we can use them to refer to the directions in our 2D simulation
            }
        }
        
        // create a pseudorandom bias for each output neuron (level.numberOfBiases = level.outputs.length)
        for(let i=0;i<level.biases.length;i++){ // create a bias for each output
            level.biases[i]=Math.random()*2-1;
        }
    }
    
    // compute the output neuron values from input neuron values
    static feedNextLevel(givenInputs,level){

        // store the inputs in level.inputs
        for(let i=0;i<givenInputs.length;i++){
            level.inputs[i]=givenInputs[i];
        }

        // for each output neuron
        for(let i=0;i<level.outputs.length;i++){
            let neuron=0

            // compute the weighted sum of all the input neurons 
            for(let j=0;j<level.inputs.length;j++){
                neuron+=level.inputs[j]*level.weights[j][i]; // the value of the neuron is equal to the sumatory of all the values of the previous neurons, each one multiplied by the corresponding weight of its connection, and ...
            } // weight of input j and output i
            
            if(neuron>level.biases[i]){ // if the neuron value is greater than the bias of the corresponding output neuron
            // if(neuron+level.biases[i]>0){    // same??? 
                level.outputs[i]=1;
            }else{
                level.outputs[i]=0;
            }
        }

        return level.outputs;
    }
}