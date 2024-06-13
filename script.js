class Ship{
    constructor(length){
        this.length = length;
        this.hitTimes = 0;
        this.sunk = false;
        this.coordinates = [];
        this.direction = "horizontal";
    }

    hit(){
        this.hitTimes += 1;
    }

    isSunk(){
        if (this.hitTimes == this.length){
            this.sunk = true;
            return true;
        }
        return false;
    }
    
    setCoordinates(xStart, yStart){
        if (this.direction == "horizontal"){
            for (let i = yStart; i<yStart+this.length;i++){
                this.coordinates.push([xStart, i]);
            }
        }else{
            for (let i = xStart; i<xStart + this.length; i++){
                this.coordinates.push([i, yStart]);
            }
        }
    }

    setDirection(direction){
        this.direction = direction;
    }

}

function includes(array, subarray){
    for (let elem of array){
        let [x,y] = elem;
        if (x == subarray[0] && y == subarray[1]){
            return true;
        }
    }
    return false;
}

class Gameboard{
    constructor(){
        this.field = [];
        for (let i = 0; i<10; i++){
           this.field[i] = [];
            for (let j = 0; j<10; j++){
                this.field[i][j] = "-";
            }
        }
        this.ships = [];
        this.coordinatesHit = [];
        this.missedShots = [];
    }

    placeShip(ship, xStart, yStart, direction="horizontal"){
        if (!this.canPlace(ship ,xStart, yStart, direction)){
            return new Error("Invalid Coordinates");
        }

        if(direction == "horizontal"){
            for (let i = yStart; i<yStart+ship.length; i++){
                this.field[xStart][i] = "0";
            }
        } else if (direction == "vertical"){
            for (let i = xStart; i<xStart+ship.length; i++){
                this.field[i][yStart] = "0";
            }
        }

        ship.setCoordinates(xStart, yStart);
        this.ships.push(ship);
        return true;
    }

    canPlace(ship, xStart, yStart, direction="horizontal"){
        if (direction == "horizontal"){
            if (yStart+ship.length>10){
                return false;
            }
            for (let i = Math.max(0, yStart-1); i<Math.min(yStart+ship.length+1,10); i++){
                if (this.field[xStart][i] != "-"){
                    return false;
                }
                if (xStart!=0){
                    if (this.field[xStart-1][i] != "-"){
                        return false;
                    }
                }
                if (xStart!=9){
                    if (this.field[xStart+1][i] != "-"){
                        return false;
                    }
                }
                
            }
            return true;
        }else{
            if (xStart+ship.length>10){
                return false;
            }
            for (let i = Math.max(xStart-1,0); i<Math.min(xStart+ship.length+1,10); i++){
                if (this.field[i][yStart] != "-"){
                    return false;
                }
                
                if (yStart!=0){
                    if (this.field[i][yStart-1] != "-"){
                        return false;
                    }
                }

                if (yStart!=9){
                    if (this.field[i][yStart+1] != "-"){
                        return false;
                    }
                }
            }
            return true;
        }
    }

    display(){
        let result = "";
        for (let i=0; i<10; i++){
            for (let j = 0; j<10; j++){
                if (includes(this.coordinatesHit, [i,j])){
                    result += "x";
                }else if (includes(this.missedShots, [i,j])){
                    result += "•";
                }else{
                    result += this.field[i][j];
                }
            }
            if (i!=9){
                result += '\n';
            }
        }
        return result;
    }

    receiveAttack(xPos, yPos){
        if (this.coordinatesHit.includes([xPos, yPos])){
            return false;
        }
        if (this.field[xPos][yPos] != "-"){
            let shipHit = this.ships.filter(ship => includes(ship.coordinates, [xPos, yPos]))[0];
            shipHit.hit();
            this.coordinatesHit.push([xPos, yPos]);
            if (shipHit.isSunk()){
                let [xStart, yStart] = shipHit.coordinates[0];
                let [xEnd, yEnd] = shipHit.coordinates[shipHit.length-1];
                if (shipHit.direction == "horizontal"){
                    for (let i = Math.max(yStart-1,0); i<=Math.min(yEnd+1,9); i++){
                        if (i==yStart - 1){
                            this.missedShots.push([xStart,i]);
                        }

                        if (xStart != 0){
                            this.missedShots.push([xStart-1,i]);
                        }
                        if (xStart != 9){
                            this.missedShots.push([xStart+1,i]);
                        }
                        if (i==yEnd+1){
                            this.missedShots.push([xStart,i]);
                        }  
                    }
                }else{
                    for (let i = Math.max(xStart-1,0); i<=Math.min(xEnd+1,9); i++){
                        if (i==xStart - 1){
                            this.missedShots.push([i,yStart]);
                        }

                        if (yStart != 0){
                            this.missedShots.push([i, yStart-1]);
                        }
                        if (yStart != 9){
                            this.missedShots.push([i, yStart+1]);
                        }
                        if (i==xEnd+1){
                            this.missedShots.push([i, yStart]);
                        }  
                    }
                }
            }
        }
        else{
            this.missedShots.push([xPos, yPos]);
        }
        return true;
    }
    
}

class Player{
    constructor(){
        // 
    }
}
export {Ship, Gameboard};  
// let a = new Gameboard();
// console.log(a.field);


// 10
// 9 
// 8 
// 7 
// 6 
// 5 
// 4 - - -- - - - --- - - 
// 3 - - -- - - -- - -- - 
// 2 - - - - - - - - - --
// 1 - - - - - - - - - --
//   1 2 3 4 5 6 7 8 9 10