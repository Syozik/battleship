import { Ship, Gameboard } from "./script";


test("Can place a ship on an empty field", ()=>{
    let ship = new Ship(2);
    let gameboard = new Gameboard();
    expect(gameboard.canPlace(ship, 1, 2)).toBeTruthy();
})

test("Placing a ship on the field",()=>{
    let ship = new Ship(2);
    let gameboard = new Gameboard();
    gameboard.placeShip(ship, 0,0);
    expect(gameboard.display())
    .toBe(`00--------
----------
----------
----------
----------
----------
----------
----------
----------
----------`);
})

test("Can't place a ship on the field where a ship already placed",()=>{
    let ship = new Ship(2);
    let gameboard = new Gameboard();
    gameboard.placeShip(ship, 0,0);
    expect(gameboard.canPlace(ship, 0,1)).toBeFalsy();
})

test("Can't place a ship on the field with a neighbor",()=>{
    let ship = new Ship(3);
    let gameboard = new Gameboard();
    gameboard.placeShip(ship, 1,2);
    expect(gameboard.canPlace(new Ship(1), 0,1)).toBeFalsy();
})

test("Missed coordinates are displayed correctly", ()=>{
    let ship = new Ship(3);
    let gameboard = new Gameboard();
    gameboard.placeShip(ship, 1,2);
    gameboard.receiveAttack(5,5);
    expect(gameboard.display())
    .toBe(`----------
--000-----
----------
----------
----------
-----•----
----------
----------
----------
----------`);
})

test("Hit coordinates are displayed correctly", ()=>{
    let ship = new Ship(3);
    let gameboard = new Gameboard();
    gameboard.placeShip(ship, 1,2);
    gameboard.receiveAttack(1,3);
    expect(gameboard.display())
    .toBe(`----------
--0x0-----
----------
----------
----------
----------
----------
----------
----------
----------`);
})

test("Sunk ships are displayed correctly", ()=>{
    let ship = new Ship(3);
    let gameboard = new Gameboard();
    gameboard.placeShip(ship, 1,2);
    gameboard.receiveAttack(1,3);
    gameboard.receiveAttack(1,4);
    gameboard.receiveAttack(1,5);
    gameboard.receiveAttack(1,2);
    expect(gameboard.display())
    .toBe(`-•••••----
-•xxx•----
-•••••----
----------
----------
----------
----------
----------
----------
----------`);
})

