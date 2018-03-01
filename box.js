/**
 * Identifies if the program is in debug mode
 */
var debug_mode;

/**
 * Size of the grid
 * @type {number}
 */
const size = 10;

/**
 * Number of cell selected by the user (graphically identified as rounds)
 * @type {number}
 */
var rounds;

/**
 * Number of atoms in the grid
 * @type {number}
 */
const atoms = 5;

/**
 * Score of the user
 * @type {number}
 */
var score;

/**
 * Universe (actually an array that is storing all the cells)
 * @type {Array}
 */
var universe;

/**
 * Creation of the universe ^.^
 */
function universeCreation(){
    universe = [];
    var li, co, line;
    for(li = 0; li < size ; li += 1){
        line = [];
        for(co = 0; co < size; co += 1){
            line.push(new Cell(li,co));
        }
        universe.push(line);
    }
}

/**
 * Initialisation of the atoms in the universe
 */
function atomsInit(){
    var available_lines = [];
    var available_columns = [];
    var i;

    for(i = 1 ; i < size-1 ; ++i){
        available_lines.push(i);
        available_columns.push(i);
    }

    for(i = 1 ; i <= atoms ; ++i) {
        var li = available_lines[Math.floor(Math.random() * available_lines.length)];
        var co = available_columns[Math.floor(Math.random() * available_columns.length)];
        universe[li][co].atom = true;
        available_lines.splice(available_lines.indexOf( li ), 1);
        available_columns.splice(available_columns.indexOf(co ), 1);
    }
}

/**
 * Creation of the html grid according to the universe
 */
function gridCreation(){
    rounds = 0;
    score = 0;
    debug_mode = false;
    var d = window.document;
    var table = d.createElement("table");
    table.style.margin = "0 auto";
    table.style.border = "2px solid black";
    table.style.borderCollapse = "collapse";
    for(var i = 0; i<size; ++i){
        var tr = d.createElement("tr");
        table.appendChild(tr);
        for(var j = 0; j<size; ++j){
            var td = d.createElement("td");
            var cell = universe[i][j];
            cell.dom = td;
            cell.initialize();
            td.style.width = "25px";
            td.style.height = "25px";
            td.style.border = "1px solid black";
            tr.appendChild(td);
        }
    }
    d.getElementById("game").appendChild(table);
}

/**
 * Cell class ? ops, it's not a class, but its behaviour is alike ...
 * @param line
 * @param column
 */
function Cell(line, column){
    this.li = line;
    this.co = column;
    this.atom = false;
    this.dom = null;
    this.validated_round = false;
    var instance = this;
    this.grid = (this.li > 0) && (this.li < size-1) && (this.co > 0) && (this.co < size-1);
    this.round = null;

    this.initialize = function() {
        var color = "";
        if ((this.li === 0 && this.co === 0) || (this.li === size - 1 && this.co === 0) || (this.li === size - 1 && this.co === size - 1) || (this.li === 0 && this.co === size - 1)) {
            // Funny note: gray is actually dark gray and dark gray is light gray ...
            color = "grey";
        } else if (this.li === 0 || this.co === 0 || this.co === size - 1 || this.li === size - 1) {
            color = "darkgrey";
            this.dom.addEventListener("click", function(){
                handleGrayClick(instance);
            });
        } else {
            this.dom.addEventListener("click", function(){
                handleWhiteClick(instance);
            });
            color = "white";
        }

        this.dom.style.backgroundColor = color;
    };
}

/**
 * Function that is used to handle the interaction fo the user on the white cells.
 * It is here used to permit to the user to select where does he thinks that the atoms are.
 * @param clicked_cell
 */
function handleWhiteClick(clicked_cell){

    if(clicked_cell.round == null) {
        // If there is less rounds than atom, it is possible to add a round
        if(rounds < atoms){
            clicked_cell.round = window.document.createElement("b");
            clicked_cell.round.style.display = "block";
            clicked_cell.round.style.width = "25px";
            clicked_cell.round.style.height = "25px";
            clicked_cell.round.style.backgroundColor = "black";
            clicked_cell.round.style.borderRadius = "50%";
            clicked_cell.dom.appendChild(clicked_cell.round);
            rounds ++;
        }
    }else if(!clicked_cell.validated_round){
        clicked_cell.dom.removeChild(clicked_cell.round);
        clicked_cell.round = null;
        rounds --;
    }
}


/**
 * Function that is used to calculate the evolution of the laser according to the atoms.
 * It is called whenever the user clicks on a light gray cell.
 * Points calculation :
 *   Each entry and exit location of the laser is worth one point.
 *   Thus reflections and absorption cost one point, while deviations cost two points.
 *   Each misidentified atom position costs 5 penalty points.
 *   The best score is therefore the closest to zero.
 * @param clicked_cell the cell on which the user clicked
 */
function handleGrayClick(clicked_cell){

    // 1 -> change the color of the selected cell
    clicked_cell.dom.style.backgroundColor = "#31B404";
    updateScore(1);

    // 2 -> determine the increments to use
    var line_increment = 0;
    var column_increment = 0;
    if(clicked_cell.co === 0){
        column_increment = 1;
    }else if(clicked_cell.co === size - 1){
        column_increment = -1;
    }else if(clicked_cell.li === 0){
        line_increment = 1;
    }else if(clicked_cell.li === size - 1){
        line_increment = -1;
    }

    // 3 -> find the result cell
    var result_cell =  shootResult(clicked_cell, line_increment, column_increment);

    // 4 -> change the color of the result cell
    if(result_cell != null){
        result_cell.dom.style.backgroundColor = "#B40404";

        // Different ending cell means that the laser finished in a different cell, so the score increments of 1
        if(result_cell !== clicked_cell){
            updateScore(1);
        }
    }

}

/**
 * Recursive function that returns a cell or null.
 * Used to calculate the path of the laser according to the atoms.
 * line_increment et column_increment can get the values -1; 0 et 1
 * @param cell
 * @param line_increment
 * @param column_increment
 * @returns the ending cell or null if absorbed
 */
function shootResult (cell, line_increment, column_increment) {
    var next_cell = universe[cell.li + line_increment][cell.co + column_increment];

    if(cell.dom.style.backgroundColor !== "rgb(49, 180, 4)"){ // rgb(49, 180, 4) means #31B404 (green) !!

        cell.dom.style.backgroundColor = "#FF8000";
    }

    // The next cell is out of the grid - so we are in a gray cell
    if (!next_cell.grid) {
        return next_cell;
    }

    // If there is an atom in the next cell
    if (next_cell.atom) {
        cell.dom.style.backgroundColor = "#B40404";
        return null; // Absorption
    }

    // This is the case when we move vertically
    if (column_increment === 0) {

        // Case if an atom is next to the next_cell -> so we turn around and go back  (only happens on the start, so we are already on a gray cell)
        if(universe[next_cell.li][next_cell.co - 1].atom || universe[next_cell.li][next_cell.co + 1].atom){
            cell.dom.style.backgroundColor = "#B40404";
            return cell;
        }

        // there are 2 atoms separated by a space => go back "reflexion"
        if (universe[next_cell.li + line_increment][next_cell.co - 1].atom && universe[next_cell.li + line_increment][next_cell.co + 1].atom) {
            return shootResult(cell, -line_increment, 0);
        }

        if (universe[next_cell.li + line_increment][next_cell.co - 1].atom) {
            return shootResult(next_cell, 0, 1);
        }
        if (universe[next_cell.li + line_increment][next_cell.co + 1].atom) {
            return shootResult(next_cell, 0, -1);
        }


    }
    // This is the case when we move horizontally
    else if (line_increment === 0)
    {
        // Case if an atom is next to the next_cell -> so we turn around and go back (only happens on the start, so we are already on a gray cell)
        if(universe[next_cell.li - 1][next_cell.co].atom || universe[next_cell.li + 1][next_cell.co].atom){
            cell.dom.style.backgroundColor = "#B40404";
            return cell;
        }

        if (universe[next_cell.li - 1][next_cell.co + column_increment].atom && universe[next_cell.li + 1][next_cell.co + column_increment].atom) {
            return shootResult(cell, 0, -column_increment);
        }

        if (universe[next_cell.li - 1][next_cell.co + column_increment].atom) {
            return shootResult(next_cell, 1, 0);
        }
        if (universe[next_cell.li + 1][next_cell.co + column_increment].atom) {
            return shootResult(next_cell, -1, 0);
        }
    }
    else
    {
        throw "Line and column increment are set to 0, the atom won't move !";
    }
    return shootResult(next_cell, line_increment, column_increment);
}

/**
 * Updates the score, and updates the html container
 * @param increment
 */
function updateScore(increment){
    score += increment;
    document.getElementById("score").innerHTML = score.toString();
}

/**
 * Checks if the user placed his rounds at the right place !
 * => score + 5 if it is false
 */
function onValidateClick(){
    if(rounds === atoms){
        var rounds_list = getRounds();

        if(rounds_list.length !== atoms){
            throw "getRounds() method must be messing around...";
        }

        var success_count = 0;
        for(var i = 0 ; i < rounds_list.length ; ++ i){
            if(rounds_list[i].atom){
                success_count ++;
                // If it is the true placement, then the user won't be able to remove the round
                rounds_list[i].validated_round = true;
            }else{
                // If the round is wrongly placed, then we remove it
                // PS: Using handleWhiteClick prevent us from updating the view
                handleWhiteClick(rounds_list[i]);
            }
        }

        console.log(success_count);

        if(success_count === atoms){
            // The user finished the game

            // Update the history
            var history = document.getElementById("history");
            var li = document.createElement("li");
            var date = new Date();
            li.innerHTML = "Date : " + date.toLocaleTimeString() + ", score : " + score.toString();
            history.appendChild(li);

            // Reset the game
            // Fast way of getting rid of children
            var game = document.getElementById("game");
            while (game.firstChild) {
                game.removeChild(game.firstChild);
            }
            universeCreation();
            atomsInit();
            gridCreation();
            updateScore(0);
        }else {
            updateScore((atoms - success_count) * 5);
        }
    }
}

function onDebugClick(){
    debug_mode = !debug_mode;
    for(var li = 1 ; li < size - 1 ; ++ li){
        for(var co = 1; co < size -1 ; ++ co){
            if(universe[li][co].atom){
                if(debug_mode){
                    universe[li][co].dom.style.backgroundColor = "red";
                }else{
                    universe[li][co].dom.style.backgroundColor = "white";
                }
            }
        }
    }
}

/**
 * Find all the rounds placed and returns the array containing all the cells that have rounds.
 * @returns {Array}
 */
function getRounds(){
    var rounds_list = [];
    for(var li = 1 ; li < size - 1 ; ++ li){
        for(var co = 1; co < size -1 ; ++ co){
            if(universe[li][co].round != null){
                rounds_list.push(universe[li][co]);
            }
        }
    }
    return rounds_list;
}

/**
 * Sort of main ;)
 * Pro TIP: if you find that your javascript file isn't loaded by the browser, but an other one is,
 * it may be because your javascript file is cached. To work around, you can put a new NUMBER in this :
 * <script src="box.js?NUMBER" type="application/javascript"></script>
 */
function init() {
    universeCreation();
    atomsInit();
    gridCreation();
    document.getElementById("validate").onclick = onValidateClick;
    document.getElementById("debug").onclick = onDebugClick;
    updateScore(0);
}