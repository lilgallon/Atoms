var size = 10;

function creationTableau(){
    var d = window.document;
    var table = d.createElement("table");
    table.style.border = "2px solid black";
    table.style.borderCollapse = "collapse";
    for(var i = 0; i<size; ++i){
        var tr = d.createElement("tr");
        table.appendChild(tr);
        for(var j = 0; j<size; ++j){
            var td = d.createElement("td");
            var cell = univers[i][j];//new cellule(i,j);
            cell.dom = td;
            cell.initialiser();
            td.style.width = "25px";
            td.style.height = "25px";
            td.style.border = "1px solid black";
            tr.appendChild(td);
        }
    }
    d.getElementById("jeu").appendChild(table);
}

function cellule(li, co){
    this.li = li;
    this.co = co;
    this.etat = -1;
    this.atome = false;
    this.dom = null;
    var instance = this;
    this.grille = (li > 0) && (li < size-1) && (co > 0) && (co < size-1);
    this.rond = null;

    this.initialiser = function() {
        var couleur = "";
        if ((li === 0 && co === 0) || (li === size - 1 && co === 0) || (li === size - 1 && co === size - 1) || (li === 0 && co === size - 1)) {
            couleur = "grey";
        } else if (li === 0 || co === 0 || co === size - 1 || li === size - 1) {
            couleur = "darkgrey";
            this.dom.addEventListener("click", function(){
                gererAppuiGris(instance);
            });
        } else {
            this.dom.addEventListener("click", function(){
                gererAppuiBlanc(instance);
            });
            couleur = "white";
        }

        this.dom.style.backgroundColor = couleur;
    };
}

function gererAppuiBlanc(cell){
    if(cell.rond == null) {
        cell.rond = window.document.createElement("b");
        cell.rond.style.display = "block";
        cell.rond.style.width = "25px";
        cell.rond.style.height = "25px";
        cell.rond.style.backgroundColor = "black";
        cell.rond.style.borderRadius = "50%";
        cell.dom.appendChild(cell.rond);
    }else{
        cell.dom.removeChild(cell.rond);
        cell.rond = null;
    }
}

function gererAppuiGris(cell){

    if(cell.dom.style.getPropertyValue("background-color") !== "darkgrey"){ // trop bien là il faut un tiret
        cell.dom.style.backgroundColor = "darkgrey";
    }else{
        var red = Math.floor(Math.random() * 255);
        var green = Math.floor(Math.random() * 255);
        var blue = Math.floor(Math.random() * 255);

        cell.dom.style.backgroundColor = "rgb(" + red + ","  +green + "," + blue + ")";
    }
}

function initAtomes(){
    var nb_atomes = 5;
    var lignes_disponibles = [];
    var colonnes_disponibles = [];

    for(var i = 1 ; i < size-1 ; ++i){
        lignes_disponibles.push(i);
        colonnes_disponibles.push(i);
    }

    for(var i = 1 ; i <= nb_atomes ; ++i) {
        var li = lignes_disponibles[Math.floor(Math.random() * lignes_disponibles.length)];
        var co = colonnes_disponibles[Math.floor(Math.random() * colonnes_disponibles.length)];
        univers[li][co].atome = true;
        lignes_disponibles.slice(li, 1);
        colonnes_disponibles.slice(co, 1);
    }
}

function creerUnivers(){
    var li, co, ligne;
    univers = [];
    for(li = 0; li < size ; li += 1){
        ligne = [];
        for(co = 0; co < size; co += 1){
            ligne.push(new cellule(li,co));
        }
        univers.push(ligne);
    }
}


function init() {
    creerUnivers();
    initAtomes();
    creationTableau();
}