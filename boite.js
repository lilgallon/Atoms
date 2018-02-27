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
            var cell = new cellule(i,j);
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


function init() {
    creationTableau();
}