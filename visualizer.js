// colors meaning:

// neurons:
// yellow neuron are activated
// dark neurons aren't

// for the following two transparency is a metric:
// it indicates the absolute value of the bias: more transparent indicates lower absolute values, more vivid color indicates greater absolute value of the bias)

// neurons dashes: biases (that's why not appear in the neurons that represents the readings of the rays)
// yellow neuron dashes represents positive weights
// blue neuron dashes represents negative weights

// connections:
// yellow connections means negative 
// blue connection express negative

class Visualizer{
    static drawNetwork(ctx,network,sensorReadings){
        // define the space where we will draw the network
        const margin=50;
        const width=ctx.canvas.width-margin*2; // we have to duplicate the margin otherwise the width where we can draaw will go out of the network canvas, for some reason
        const height=ctx.canvas.height-margin*2;

        // margins coordenates of the network canvas
        const left=margin;
        const right=width+left*2.2;
        const top=margin;
        const bottom=height+top;

        // finally a characteristic of each level
        const levelHeight=height/network.levels.length+1;

        ctx.setLineDash([7,3]);
        Visualizer.drawLevel(ctx,
            network.levels[1],
            right,left,
            top,top+levelHeight,
            [],["^","<",">","v"], // we won't draw anything in the input, since we won't draw the input level of this level/layer, but we do will draw the output of as arrows to visualize better the behaviour of the network
            false); // the first level we are going to draw is the second one with only the last layer

        ctx.setLineDash([7,3]);
        Visualizer.drawLevel(ctx,
            network.levels[0],
            right,left,
            bottom-levelHeight,bottom,
            sensorReadings);
    }

    // necessary bcuz each level will have its own coordinates and space
    static drawLevel(ctx,level,right,left,top,bottom,inputLabelToDisplay=[],outputLabelToDisplay=[],draw_intput_layer=true){
        
        const nodeRadious=18;
        const {inputs,outputs,weights,biases}=level; // kinda like unpacking in Python, but for attributes of an object???
       
        if(inputLabelToDisplay==[] && draw_intput_layer){
            inputLabelToDisplay=inputs;
        }

        // for avoiding recalculation since we the positions of the connections will also be where the neurons/nodes are going to be
        let outputNodesXs=[]
        let inputNodesXs=[]

        // draw the connections between the neurons
        for(let i=0;i<inputs.length;i++){
            const xInput=Visualizer.#getNodeX(inputs,i,left,right) // store the neurons coordinates, so we don't have to recalculate this values again
            for(let j=0;j<outputs.length;j++){
                const xOutput=Visualizer.#getNodeX(outputs,j,left,right)
                ctx.beginPath();
                ctx.moveTo(
                    xInput,
                    bottom);
                ctx.lineTo(
                    xOutput,
                    top);
                ctx.lineWidth=2;

                ctx.strokeStyle=Visualizer.#getRGBA(weights[i][j],inputs[i])
                ctx.stroke();
    
                // here we store the x coordinates of each node
                if(i==0){
                    outputNodesXs.push(xOutput)
                }
            }
            // here we store again
            inputNodesXs.push(xInput)
        }

        // draw input neurons/nodes
        if(draw_intput_layer){
            for(let i=0;i<inputs.length;i++){          
                // first we draw a black circle in the positions of the nodes to make the circunferences that surround the node don't get mixed with the connections
                ctx.beginPath();
                ctx.arc(inputNodesXs[i],bottom,nodeRadious,0,Math.PI*2)
                ctx.fillStyle="black";
                ctx.fill();

                // then we draw the actual circles of the nodes
                ctx.beginPath();
                ctx.arc(inputNodesXs[i],bottom,nodeRadious*0.6,0,Math.PI*2)
                ctx.fillStyle=Visualizer.#getRGBA(inputs[i]);
                ctx.fill();

                // for visualizing labels (as strings)
                if(inputLabelToDisplay.length!=0){
                    ctx.beginPath();
                    ctx.setLineDash([]) // I don't want the labels to be dashed
                    ctx.textAlign="center";
                    ctx.textBaseline="middle";
                    ctx.fillStyle="black";
                    ctx.strokeStyle="white";
                    ctx.font=(nodeRadious*1)+"px Arial";

                    // for visualizing the rays offsets as labels
                    // if have to set this mini-block bcuz some of the readings are 'null'
                    if(inputLabelToDisplay[i]){
                        inputLabelToDisplay[i].offset=1-inputLabelToDisplay[i].offset // I want to know the percent of the reading stimulus, whic os the inverse of the offset: e.g. if the ofset is 0.4, that means we intercept the rays at the 40% of the ray beginning, but I want the opposite: how close to the entire ray length is the reading
                        var label=Math.round(inputLabelToDisplay[i].offset*100)/100;
                    }else{
                        var label=0
                    }

                    label=label.toString();
                    
                    ctx.fillText(label,inputNodesXs[i],bottom+30);
                    ctx.lineWidth=0.5;
                    ctx.strokeText(label,inputNodesXs[i],bottom+30);
                }

            }
        }

        // draw output neurons/nodes
        for(let i=0;i<outputs.length;i++){
            // first we draw a black circle in the positions of the nodes to make the circunferences that surround the node don't get mixed with the connections
            ctx.beginPath();
            ctx.arc(outputNodesXs[i],top,nodeRadious,0,Math.PI*2)
            ctx.fillStyle="black";
            ctx.fill();

            // then the real node again
            ctx.beginPath();
            ctx.arc(outputNodesXs[i],top,nodeRadious*0.6,0,Math.PI*2)
            ctx.fillStyle=Visualizer.#getRGBA(outputs[i]); // this is what makes the nodes can vary its filling color
            ctx.fill();
            
            // for each output neuron/node draw a circunference surrounding it. Take into account: remember biases are only computed when we calculate the activation of a neuron of the next layer/level, so it doesn't makes sense to draw anything representing the bias in the input neurons that represents the readings of the sensor.
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.arc(outputNodesXs[i],top,nodeRadious*0.8,0,Math.PI*2) // at *0.8 so along with the previous combination between the circles we can watch them better

            // make dash lines representing the biases values
            // I created this block for visualizing the biases better. Later I found that the problem was that I had the computer brightness level too low :D
            let dashesValue = 0
            if(biases[i]>0){
                dashesValue = biases[i]// + 0.2
            }else if(biases[i]<0){
                dashesValue = biases[i]// - 0.2
            }

            // stroke and get the values for the colors of the dashes
            ctx.strokeStyle=Visualizer.#getRGBA(dashesValue);
            ctx.setLineDash([7,3])
            ctx.stroke();
            ctx.setLineDash([])

            // for visualizing labels (as strings)
            // draw the arrows only, since the only level with the argument of output label is the one that has as an argument the symbols trying ti represent arrows
            if(outputLabelToDisplay.length!=0){
                ctx.beginPath();
                ctx.setLineDash([]) // I don't want the labels to be dashed
                ctx.textAlign="center";
                ctx.textBaseline="middle";
                ctx.fillStyle="black";
                ctx.strokeStyle="white";
                ctx.font=(nodeRadious*1.5)+"px Arial";
                ctx.fillText(outputLabelToDisplay[i],outputNodesXs[i],top+2);
                ctx.lineWidth=1;
                ctx.strokeText(outputLabelToDisplay[i],outputNodesXs[i],top+2);
            }
        }
    }

    static #getNodeX(nodes,index,left,right){
        return lerp(
            left,
            right,
            index/nodes.length
        );      
    }

    // for changing the color of the connections dynamically, according to their weights
    static #getRGBA(value,input=1){ // remember this value in the case of the weights will be between -1 and 1. By the other hand, the value of 'input' (an optional parameter) is the corresponding variable value of the input neuron, which we are using to determine the opacity/transparency (alpha) of the conection
        var squishedInput=input
        while(squishedInput>10){
            squishedInput=squishedInput/10
        }
        const alpha=Math.abs(value)*squishedInput; // we will determine the opacity/transparency of the color by the absolute value of the weight
        const R=value<0?0:255; // if the value is smaller than 0, we will abtain a completely read color
        const G=R; // they will be activated under the same conditions (bcuz we want Green + Red = Yellow)
        const B=value>0?0:255; // the opposite to the previous two
        return "rgba("+R+","+G+","+B+","+alpha+")"; // red,green,blue,alpha(transparency/opacity)
    }
}