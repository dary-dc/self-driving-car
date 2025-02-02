// linear interpolation
// the length of a segment times the proportion of times we want to divide the line, finally plus the starting point
function lerp(A, B, t){
    return A+(B-A)*t; 
}
// explaination: (in the context of lane drawing)

// we add one third of (this.right-this.left) to the starting point 'x-width/2' and we obtain the x coordinates of the first lane we have to draw

// segment intersection finding code:
function getIntersectionAndProportion(A, B, C, D){
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);

    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){ // if there's an intersection (t>0) and the intersection is before or till the start of the ray (t<=1)
            return { // t>=0 && t<=1 this piece of code makes the code works for the lines, and this other && u>=0 && u<=1 makes it works for segments, not only lines.
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B.y,t),
                offset:t
            }
        }
    }
    return null;
}

function polysIntersect(poly1, poly2){
    for(let i=0;i<poly1.length;i++){
        for(let j=0;j<poly2.length;j++){
            const touch=getIntersectionAndProportion(
                poly1[i],
                poly1[(i+1)%poly1.length],
                poly2[j],
                poly2[(j+1)%poly2.length]
            );
            if(touch){
                return true;
            }
        }
    }
    return false;
}

// considering the segment of the polygon


// the first use of the foolwing two functions is for randomizing the neuronal network with a fixed percent of variation
// we select as many elements random unique elements from the network.level.weights and from the network.level.biases arrays as the 'variation' variable indicates to us
// (that last variable is a number between 0 and 1, which multiplied by network.level.weights (and rounded to an integer) give us the number of random unique weights we have to vary to accomplish that percent. Smae goes for biases)

function getRandomUniqueElementFrom(array){
    const shuffledArray = array.slice(); // create a shallow copy of the array (no need of a deep copy)
    shuffle(shuffledArray); // use our helper function
    return shuffledArray.pop(); // drop the last but random element, which allow uniqueness
}

// randomly interchange the elements in an array
// still for reviewing
function shuffle(array){
    for(let i=0;i<array.length;i++){
        const j = Math.floor(Math.random()*(array.length - 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}