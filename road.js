class Road{
    constructor(x,width,laneCount){
        this.x=x; // coordinates of the road center
        this.width=width; // width of the entire road
        this.laneCount=laneCount; // number of lanes (carriles)

        // coordinates for the street leftmost and rightmost lines
        this.left=x-width/2;
        this.right=x+width/2;

        // set the end and the start of the road
        const infinity=1000000; // there's a number for infinity, but it cannot be used for drawing (at least that's what the tutorial said)
        this.top=-infinity;
        this.bottom=infinity;

        // create segments limiting the borders of the road
        // set the points as pair of coordimates
        const topLeft={x:this.left,y:this.top};
        const bottomLeft={x:this.left,y:this.bottom};
        const topRight={x:this.right,y:this.top};
        const bottomRight={x:this.right,y:this.bottom};
        this.borders=[
            [topLeft,bottomLeft],
            [topRight,bottomRight]
        ];

    }

    // Now we need let know the car which coordinates coorespond to te center of a lane
    getLaneCenter(laneIndex){ // yeah. there are four lanes
        const laneWidth=this.width/this.laneCount; // the width of the lane is the width of the road between the number of lanes
        return this.left+laneWidth/2+Math.min(laneIndex,this.laneCount-1)*laneWidth; // first we calculate the x coordinates of the center of the first lane, the place it in the asked middle lane
    } // we could use Math.min to ensure that if we enter a numer much bigger than the number of lanes our car doesn't appear out of the road

    draw(ctx){
        ctx.lineWidth=5;
        ctx.strokeStyle="white";

        // to draw the 3 lanes
        for(let i=1;i<=this.laneCount-1;i++){
            const x=lerp( // linear interpolation
                this.left,
                this.right,
                i/this.laneCount
            );
            // with the previous code we generate x coordinates: at the beginning, at the first third, at the second third, and at the third third.
            // make the middle lines intermitent
            ctx.setLineDash([20,20]);
            // make the leftmost and rightmost lines continuous
            ctx.beginPath(); // every time you start drawing something you need to start with the beginPath() method to ensure the code below gets interpreted as the draw commands
            ctx.moveTo(x,this.top); // move the "drawing pen" to a position
            ctx.lineTo(x,this.bottom); // draw from the previous point (from moveTo()) to the new point (the current arguments)
            ctx.stroke(); // set the strokeStyle and lineWidth (basically the line draw increases its width and becomes white)
        }

        ctx.setLineDash([]);
        
        // use the borders defined in the constructor method to create border lines in the road
        ctx.beginPath();
        this.borders.forEach(border=>{
            ctx.moveTo(border[0].x,border[0].y);
            ctx.lineTo(border[1].x,border[1].y);
        });
        ctx.stroke();
    }
}