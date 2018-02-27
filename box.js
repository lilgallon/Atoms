//  TODO: SOMETIMES THERE ISN'T 5 ATOMS BUT 4!!

/**
 * Size of the grid
 * @type {number}
 */
var size = 10;

/**
 * Score of the user
 * @type {number}
 */
var score = 0;

/**
 * Universe (actually an array that is storing all the cells)
 * @type {Array}
 */
var universe = [];

/**
 * Creation of the universe ^.^
 */
function universeCreation(){
    var li, co, ligne;
    for(li = 0; li < size ; li += 1){
        ligne = [];
        for(co = 0; co < size; co += 1){
            ligne.push(new cell(li,co));
        }
        universe.push(ligne);
    }
}

/**
 * Initialisation of the atoms in the universe
 */
function atomsInit(){
    var atoms_nb = 5;
    var available_lines = [];
    var available_columns = [];

    for(var i = 1 ; i < size-1 ; ++i){
        available_lines.push(i);
        available_columns.push(i);
    }

    for(var i = 1 ; i <= atoms_nb ; ++i) {
        var li = available_lines[Math.floor(Math.random() * available_lines.length)];
        var co = available_columns[Math.floor(Math.random() * available_columns.length)];
        universe[li][co].atom = true;
        available_lines.slice(li, 1);
        available_columns.slice(co, 1);
    }
}

/**
 * Creation of the html grid according to the universe
 */
function gridCreation(){
    var d = window.document;
    var table = d.createElement("table");
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
            if(cell.atom){
                cell.dom.style.backgroundColor = "red";
            }
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
function cell(line, column){
    this.li = line;
    this.co = column;
    this.state = -1;
    this.atom = false;
    this.dom = null;
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
        clicked_cell.round = window.document.createElement("b");
        clicked_cell.round.style.display = "block";
        clicked_cell.round.style.width = "25px";
        clicked_cell.round.style.height = "25px";
        clicked_cell.round.style.backgroundColor = "black";
        clicked_cell.round.style.borderRadius = "50%";
        clicked_cell.dom.appendChild(clicked_cell.round);
    }else{
        clicked_cell.dom.removeChild(clicked_cell.round);
        clicked_cell.round = null;
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
    clicked_cell.dom.style.backgroundColor = "blue";
    score += 1;

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
        result_cell.dom.style.backgroundColor = "aqua";

        // Different ending cell means that the laser finished in a different cell, so the score increments of 1
        if(result_cell !== clicked_cell){
            score += 1;
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

    // The next cell is out of the grid - so we are in a gray cell
    if (!next_cell.grid) {
        return next_cell;
    }

    // If there is an atom in the next cell
    if (next_cell.atom) {
        return null; // Absorption
    }

    // This is the case when we move vertically
    if (column_increment === 0) {

        // Case if an atom is next to the next_cell -> so we turn around and go back  (only happens on the start, so we are already on a gray cell)
        if(universe[next_cell.li][next_cell.co - 1].atom || universe[next_cell.li][next_cell.co + 1].atom){
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
 * Sort of main ;)
 */
function init() {
    universeCreation();
    atomsInit();
    gridCreation();
}