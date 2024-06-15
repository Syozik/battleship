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

function include(array, subarray){
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
                this.field[i][j] = "";
            }
        }
        this.ships = [];
        this.checkedCoordinates = [];
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
        ship.setDirection(direction);
        ship.setCoordinates(xStart, yStart);
        this.ships.push(ship);
        return true;
    }



    canPlace(ship, xStart, yStart, direction="horizontal"){
        if (xStart < 0 || yStart < 0)
            return false;

        if (direction == "horizontal"){
            if (yStart+ship.length>10){
                return false;
            }
            for (let i = Math.max(0, yStart-1); i<Math.min(yStart+ship.length+1,10); i++){
                if (this.field[xStart][i] != ""){
                    return false;
                }
                if (xStart!=0){
                    if (this.field[xStart-1][i] != ""){
                        return false;
                    }
                }
                if (xStart!=9){
                    if (this.field[xStart+1][i] != ""){
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
                if (this.field[i][yStart] != ""){
                    return false;
                }
                
                if (yStart!=0){
                    if (this.field[i][yStart-1] != ""){
                        return false;
                    }
                }

                if (yStart!=9){
                    if (this.field[i][yStart+1] != ""){
                        return false;
                    }
                }
            }
            return true;
        }
    }

    isPossibleToChangeDirection(ship, xStart, yStart, direction){
        let length = ship.length - 1;
        if (direction == "horizontal"){
            if (yStart+length>9){
                return false;
            }
            for (let i = yStart+1; i<Math.min(yStart+length+1,10); i++){
                if (this.field[xStart][i] != ""){
                    return false;
                }
                if (xStart!=0){
                    if (this.field[xStart-1][i] != ""){
                        return false;
                    }
                }
                if (xStart!=9){
                    if (this.field[xStart+1][i] != ""){
                        return false;
                    }
                }
                
            }
            return true;
        }else{
            if (xStart+length>9){
                return false;
            }
            for (let i = xStart+1; i<Math.min(xStart+length+1,10); i++){
                if (this.field[i][yStart] != ""){
                    return false;
                }
                
                if (yStart!=0){
                    if (this.field[i][yStart-1] != ""){
                        return false;
                    }
                }

                if (yStart!=9){
                    if (this.field[i][yStart+1] != ""){
                        return false;
                    }
                }
            }
            return true;
        }
    }

    changeShipsDirection(ship, xStart, yStart, direction){
        const index = this.ships.indexOf(ship);
        this.ships.splice(index, 1);
        for (let [x,y] of ship.coordinates){
            this.field[x][y] = "";
        }

        DOMManipulation.resetShipsClasses(ship);
        ship.coordinates = [];
        if(direction == "horizontal"){
            for (let i = yStart; i<yStart+ship.length; i++){
                this.field[xStart][i] = "0";
            }
        } else if (direction == "vertical"){
            for (let i = xStart; i<xStart+ship.length; i++){
                this.field[i][yStart] = "0";
            }
        }

        ship.setDirection(direction);
        ship.setCoordinates(xStart, yStart);
        this.ships.push(ship);
        return true;
    }

    display(){
        let result = [];
        for (let i=0; i<10; i++){
            let row = [];
            for (let j = 0; j<10; j++){
                if (include(this.coordinatesHit, [i,j])){
                    row.push("x");
                }else if (include(this.missedShots, [i,j])){
                    row.push("•");
                }else{
                    row.push(this.field[i][j]);
                }
            }
            result.push(row);
        }
        return result;
    }

    receiveAttack(xPos, yPos){
        if (include(this.checkedCoordinates, [xPos, yPos])){
            return [false];
        }

        this.checkedCoordinates.push([xPos, yPos]);
        if (this.field[xPos][yPos] != ""){
            let shipHit = this.ships.filter(ship => include(ship.coordinates, [xPos, yPos]))[0];
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
            return [true, "hit"];
        }
        else{
            this.missedShots.push([xPos, yPos]);
            return [true, "missed"];
        }
    }
    
}

class Player{
    constructor(type = "human"){
        this.gameboard = new Gameboard();
        this.ships = {"carrier":new Ship(5),
            "battleship":new Ship(4), 
            "submarine":new Ship(3), 
            "destroyer":new Ship(3), 
            "patrolBoat":new Ship(2)};
        this.allPlaced = false;
        this.type = type;
        this.checkedCoordinates = [];
        this.coordinatesHit = [];
    }

    areAllPlaced(){
        for (let ship of Object.values(this.ships)){
            if (ship.coordinates.length == 0){
                return false;
            }
        }
        this.allPlaced = true;
        return this.allPlaced;
    }

    randomlyPlaceShips(){
        this.resetBoard();
        
        this.ships = new Player(this.type).ships;

        for (let ship of Object.values(this.ships)){
            let isPlaced = false;
            while(!isPlaced){
                let x = Math.floor(Math.random()*10);
                let y = Math.floor(Math.random()*10);
                let direction;
                if (Math.random() < 0.5){
                    direction = "horizontal";
                }else{
                    direction = "vertical";
                }
                if (this.gameboard.canPlace(ship, x, y,direction)){
                    this.gameboard.placeShip(ship, x, y, direction);
                    isPlaced = true;
                }}
        }

        this.allPlaced = true;
        DOMManipulation.displayGameBoard(this);
    }

    resetBoard(){
        this.gameboard = new Gameboard();
        this.allPlaced = false;
        this.ships = new Player().ships;
        DOMManipulation.resetGameBoard(new Player(this.type));
    }

    attack(opponent, x, y){
        if (x===undefined || y===undefined){
            let availableCoordinates = [];
            if (this.coordinatesHit.length != 0){
                for (let coordinates of this.coordinatesHit){
                    let [xPos, yPos] = coordinates;
                    let areCheckedAll = true;
                    if (xPos!=9 && !include(this.checkedCoordinates, [xPos+1, yPos]) && !(include(this.coordinatesHit, [xPos, yPos-1])||include(this.coordinatesHit, [xPos,yPos-1])))
                        availableCoordinates.push([xPos+1, yPos]);
                    if (xPos!=0 && !include(this.checkedCoordinates, [xPos-1, yPos]) && !(include(this.coordinatesHit, [xPos, yPos-1])||include(this.coordinatesHit, [xPos,yPos-1])))
                        availableCoordinates.push([xPos-1, yPos]);
                    if (yPos!=9 && !include(this.checkedCoordinates, [xPos, yPos+1]) && !(include(this.coordinatesHit, [xPos-1, yPos])||include(this.coordinatesHit, [xPos+1,yPos])))
                        availableCoordinates.push([xPos, yPos+1]);
                    if (yPos!=0 && !include(this.checkedCoordinates, [xPos, yPos-1])&& !(include(this.coordinatesHit, [xPos-1, yPos])||include(this.coordinatesHit, [xPos+1,yPos])))
                        availableCoordinates.push([xPos, yPos-1]);
                    
                }
            }
            if(availableCoordinates.length == 0){
                for (let i=0; i<10; i++){
                    for (let j=0; j<10; j++){
                        if (!include(this.checkedCoordinates, [i, j])){
                            availableCoordinates.push([i, j]);
                        }
                    }
                }
            }
            [x,y] = availableCoordinates[Math.floor(Math.random()*availableCoordinates.length)];
        }

        return new Promise((resolve, reject)=>{
            let result = opponent.gameboard.receiveAttack(x, y);
            if (result[0]){
                this.checkedCoordinates.push([x,y]);
                if (result[1] == "hit"){
                    this.coordinatesHit.push([x,y]);
                }
                resolve(result[1]);
            }else{
                reject("You already have attacked the cell");
            }
        });
    }

    isGameOver(){
        for (let ship of Object.values(this.ships)){
            if (!ship.isSunk())
                return false;
        }

        return true;
    }
}

class DOMManipulation{

    static originalBody = document.body.cloneNode(true);

    static displayGameBoard(player){
        let gameboard = player.gameboard;
        let type = player.type;

        let field = gameboard.display();
        let index = type == "human" ? 0 : 1;
        for (let i=0;i<10;i++){
            for (let j=0;j<10;j++){
                let cell = document.getElementsByClassName(`${i}${j}`)[index];
                if (type == "human" && field[i][j] == "0"){
                    cell.classList.add("ship");
                    
                    if (j == 9 || field[i][j+1]=="0"){
                        if (j!=9){
                            cell.classList.add("notRightSide");
                        }
                    }

                    if (j == 0 || field[i][j-1]=="0"){
                        if (j!=0){
                            cell.classList.add("notLeftSide");
                    
                        }
                    }

                    if (i == 9 || field[i+1][j]=="0"){
                        if (i!=9){
                            cell.classList.add("notBottomSide");
                        }
                    }
                    
                    if (i == 0 || field[i-1][j]=="0"){
                        if (i!=0){
                           cell.classList.add("notTopSide");
                        }
                    }
                    
                }else if (field[i][j] == "x"){
                    cell.classList.add("hit");
                    cell.innerHTML = "x";
                    if (j == 9 || field[i][j+1] == "•")
                        cell.classList.add("rightSide");

                    if (j == 0 || field[i][j-1]=="•")
                        cell.classList.add("leftSide");

                    if (i == 9 || field[i+1][j]=="•")
                        cell.classList.add("bottomSide");
                    
                    if (i == 0 || field[i-1][j]=="•")
                        cell.classList.add("topSide");

                }else if(field[i][j] == "•"){
                    cell.classList.add("missed");
                    cell.innerHTML = "•";
                }
            }
        }

        let cellsPlaced = document.querySelectorAll(".ship");
        for (let cell of cellsPlaced){
            cell.addEventListener("click", ()=>{
                let [x,y] = cell.classList[0];
                x = +x;
                y = +y;
                for (let ship of Object.values(player.ships)){
                    if(include(ship.coordinates, [x,y])){
                        let newDirection = ship.direction == "horizontal" ? "vertical" : "horizontal";
                        let [x,y] = ship.coordinates[0];
                        if (player.gameboard.isPossibleToChangeDirection(new Ship(2), +x,+y, newDirection)){
                            player.gameboard.changeShipsDirection(ship, +x, +y, newDirection);
                            DOMManipulation.displayGameBoard(player);
                        }else{
<<<<<<< HEAD
                            console.log("Can't do that");
=======
                            console.log("Can'do that");
>>>>>>> 8d447c4 (Update script.js)
                        }
                    }
                }
            })
        }
        
    }

    static finishGame(winner){    
        let congratulationsMessage = document.querySelector(".content h2");
        congratulationsMessage.style.cssText = "font-size: 3.3rem; margin-top: 100px; text-align: center; background: rgba(115, 115, 115, 0.7); color: white; text-shadow: 2px 2px 2px black; width: 22vw";
        congratulationsMessage.innerHTML = `${winner.type} won!`.toUpperCase();
    }


    static resetGameBoard(player){
        let index = player.type == "human" ? 0 : 1;
        for (let i=0;i<10;i++){
            for (let j=0;j<10;j++){
                let cell = document.getElementsByClassName(`${i}${j}`)[index];
                cell.className = `${i}${j}`;
            }
        }

        if (player.type == "computer")
            return;

        this.resetShips();

    }
    
    static resetShipsClasses(ship){
        for (let xy of ship.coordinates){
            xy = xy.join("");
            let cells = document.querySelectorAll(`.gameboard div.ship`);
            for (let cell of cells){
                if (include(cell.classList, xy)){
                    let newCell = document.createElement("div");
                    newCell.className = `${xy}`;
                    cell.replaceWith(newCell);        
                }
            }
        }
    }

    static resetShips(){
        for (let ship of Object.keys(new Player().ships)){
            document.querySelector(`.${ship}`).style.opacity = 1;
            document.querySelector(`.${ship}`).draggable = true;
        }
    }

    static setShipsNotDraggable(ship){
        if (ship == undefined){
            for (let ship of Object.keys(new Player().ships)){
                document.querySelector(`.${ship}`).style.opacity = 0.4;
                document.querySelector(`.${ship}`).draggable = false;
            }
        }
        else{
            document.querySelector(`.${ship}`).style.opacity = 0.4;
            document.querySelector(`.${ship}`).draggable = false;
        }

    }
    static resetScreen(){
        document.body.innerHTML = this.originalBody.innerHTML;
        Main.welcomeWindow();
    }

}

const sleep = ms => new Promise(r => setTimeout(r, ms));

class Main{
    static welcomeWindow(){
        let human = new Player("human");
        let computer = new Player("computer");

        let resetButton = document.getElementById("reset");
        let randomlyPlace = document.getElementById("random");
        let startButton = document.getElementById("startGame");

        resetButton.addEventListener("click", ()=>{
            human.resetBoard();
        });

        randomlyPlace.addEventListener("click", ()=>{
            human.randomlyPlaceShips();
            DOMManipulation.setShipsNotDraggable();
        });

        startButton.addEventListener("click", ()=>{
            Main.startGame(human, computer);
        });

        let ships = ["patrolBoat", "destroyer", "submarine", "battleship", "carrier"];
        let cells = document.querySelectorAll(".gameboard *");
        for(let ship of ships){
            let shipElement = document.querySelector(`.${ship}`);
            shipElement.addEventListener("dragstart", (shipDragged)=>{
                let shipToPlace = document.querySelectorAll(":hover");
                let shipLength = shipToPlace[shipToPlace.length-3].className[1];
                let index = shipToPlace[shipToPlace.length-1].className.split(" ")[1] - 1;
                let shipClass = shipToPlace[shipToPlace.length-2].className;
                shipDragged.dataTransfer.setData("text/plain", shipLength+index+shipClass);
            })
        }

        for (let cell of cells){
            cell.addEventListener("dragover", (shipDragged)=>{
                shipDragged.preventDefault();
            })

            cell.addEventListener("drop", (shipDragged)=>{
                let [x,y] = cell.className;
                let [length, index] = shipDragged.dataTransfer.getData("text/plain").slice(0,2);
                let shipClass = shipDragged.dataTransfer.getData("text/plain").slice(2);
                if (human.gameboard.canPlace(new Ship(+length), +x, +y-index)){
                    human.gameboard.placeShip(human.ships[shipClass], +x, +y-index);
                    // delete human.ships[shipClass];
                    DOMManipulation.setShipsNotDraggable(shipClass);
                    human.areAllPlaced();
                    DOMManipulation.displayGameBoard(human);
                }else{
                    console.log("Impossible to place here;");
                }
        })
        }
        
            
        
        
    }
    
    
    static startGame(human, computer)
    {   
        
        if (!human.allPlaced){
            let message = document.querySelector("h4.message");
            message.innerHTML = "Please place all ships";
            message.style.cssText = " display: inline-block;";
            document.querySelector(".startGame").appendChild(message);
            return;
        }
         

        human.ships = new Player().ships;
        let gameOver = false;
        let moveNow = human;
        document.querySelector(".shipsSettings").style.display = "none";        
        document.querySelector(".startGame").style.display = "none";        
        document.querySelector("#rule").style.display = "none";
        
        let container = document.querySelector(".container");
        let gameboard = container.querySelector(".gameboard");
        let playerName = document.createElement("h3");
        playerName.innerText = "You";
        playerName.style.cssText = "text-align: center; font-size: 3rem; margin: 0; text-shadow: 2px 2px 2px white, -1px -1px 2px yellow";
        container.insertBefore(playerName, gameboard);
        
        let computerField = container.cloneNode(true);
        computerField.querySelector("h3").innerHTML = "Computer";
        let field = computerField.querySelector(".gameboard");
        let pattern = /div\sclass="([^"]*)"><\/div>/g;
        let replacement = 'button class="$1"></button>';
        field.innerHTML = field.innerHTML.replace(pattern, replacement);
        
        let middle = document.createElement("div");
        let text = document.createElement("h2");
        text.innerHTML = "Your move ->";
        text.style.cssText = "background: white; width: 22vw;text-align: center; font-size: 3rem; text-decoration: underline; margin-top: 100px;";
        middle.appendChild(text);
        middle.style.cssText = "display: flex; flex-direction: column; align-items: center; height: max(28.5vw, 357px);";
        let backButton = document.createElement("button");
        backButton.className = "back";
        backButton.innerText = "BACK";
        backButton.addEventListener("click", ()=>{
            DOMManipulation.resetScreen();
        })
        document.body.appendChild(backButton);

        document.querySelector(".content").style.gap = "80px";
        document.querySelector(".content").appendChild(middle);
        document.querySelector(".content").appendChild(computerField);
        
        DOMManipulation.resetGameBoard(computer);
        computer.randomlyPlaceShips();
        
        let gameboardCells = field.querySelectorAll("*");
        for (let cell of gameboardCells){
            cell.addEventListener("click", function (){
                async function attack(player, cell){
                    if (gameOver)
                        return;

                    if (player.type == "human"){
                        if (moveNow == human){
                            let x = +cell.className[0];
                            let y = +cell.className[1];
                            human.attack(computer, x, y)
                            .then((value)=>{
                                DOMManipulation.displayGameBoard(computer);
                                if (computer.isGameOver()){
                                    gameOver = true;
                                    DOMManipulation.finishGame(human);
                                    return
                                }

                                if (value == "missed"){
                                    moveNow = computer;
                                    attack(computer);
                                }
                            })  
                        }
                    }else{
                        document.querySelector(".content h2").innerHTML = "<- Computer's move";
                        await sleep(1000);
                        computer.attack(human)
                        .then((value)=>{
                            DOMManipulation.displayGameBoard(human);
                            if (human.isGameOver()){
                                gameOver = true;
                                DOMManipulation.finishGame(computer);
                                return
                            }
                            if (value == "hit")
                                attack(computer);
                        })
                        .catch(message => console.log(message));
                        document.querySelector(".content h2").innerHTML = "Your move ->";
                        moveNow = human;
                    }

                }
                attack(human, cell);
            })
        }
    }
}   

Main.welcomeWindow();