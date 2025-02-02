class Controls{
    constructor(type){
        // initially setted to false, 
        // but they will change deending on what you press
        // on the keyboard 
        this.forward=false;
        this.backward=false;
        this.left=false;
        this.right=false;

        // private method (denoted by the hashtag): keyboard 'listeners'
        switch(type){
            case "KEYS":
                this.#addKeyboardListeners();
                break;
            case "TRAFFIC":
                this.forward=true;
                break;
        }
    }

    #addKeyboardListeners(){
        document.onkeydown=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.left=true;
                    break;
                case "ArrowRight":
                    this.right=true;
                    break;
                case "ArrowUp":
                    this.forward=true;
                    break;
                case "ArrowDown":
                    this.backward=true;
                    break;
            }
        }

        document.onkeyup=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.left=false;
                    break;
                case "ArrowRight":
                    this.right=false;
                    break;
                case "ArrowUp":
                    this.forward=false;
                    break;
                case "ArrowDown":
                    this.backward=false;
                    break;
    
            }
        }
    }
}