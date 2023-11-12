import './style.less'

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
}; // function to get a given parameter in the URL

if (getUrlParameter('theme') == "xp") { // if the chosen theme is xp
  // 2023 ADDITION: we add a data-theme attribute to the body
  document.body.setAttribute('data-theme', 'xp');
} else { // sinon
  // 2023 ADDITION: we add a data-theme attribute to the body
  document.body.setAttribute('data-theme', 'default');
}

var timerTexte = document.getElementById('timer'),
  grille = document.getElementById("tableGrille"),
  secondes = 0,
  minutes = 0,
  nombreCases = 0,
  taille = 0,
  classes = [ // class list for each number of bombs around a cell
    "empty", // 0   
    "one", // 1
    "two", // 2
    "three", // 3
    "four", // 4
    "five", // 5
    "six", // 6
    "seven", // 7
    "eight" // 8
  ],
  listeCasesMines = [];


// Detects the current theme via the URL and changes it to the other one
// 2023 ADDITION: we add a data-theme attribute to the body
function switchTheme() {
  console.log("switching theme")
  let origin = window.location.href.split('?')[0]; //récupère le site ou on est (blabla.com)
  console.log(origin)
  let theme = getUrlParameter('theme'); //on récupère la variable dans l'url (/?theme=xxx)

  if (theme == "xp") { //si on a indiqué qu'on voulait le thème xp
    location.replace(origin) //on recharge la page sans thème
  } else {
    location.replace(origin + "?theme=xp") // on recharge la page avec thème
  }
}
document.getElementById("themeSwitcher").onclick = switchTheme; // on ajoute la fonction au bouton


function ajoutTemps() {

  secondes += 1; // on ajoute une seconde

  if (secondes >= 60) { // si on a 60 secondes
    secondes = 0; // on les remet à 0
    minutes++; //et on ajoute une minute
  }

  let timestamp = String(minutes).padStart(2, '0') + ":" + String(secondes).padStart(2, '0');
  // on force le texte à avoir deux chiffres minimum

  timerTexte.textContent = timestamp //on met le texte dans la balise timer

  attente(); // on attend une seconde
}

function attente() {
  var timer = setTimeout(ajoutTemps, 1000);
  // we wait one second, then we add one second to the counter
}

function chronoStart() {
  clearInterval(timer); // on arrête l'attente
  attente(); // on lance l'attente
}

function genererGrille(value) {
  console.log(value) // we log the value of the difficulty
  nombreCases = 0;
  taille = 0; // we put the variables back to 0

  switch (value) {
    // on met en place la largeur/hauteur selon la difficulté
    case '0':
      console.log("debutant");
      taille = 9;
      break;

    case '1':
      console.log("intermediaire")
      taille = 16;
      break;

    case '2':
      console.log("expert")
      taille = 22;
      break;

    case '3':
      console.log("maitre")
      taille = 30;
      break;

    default:
      console.log("invalide, on met debutant")
      taille = 9;
      break;

  }

  //vidage de la table
  while (grille.firstChild) { // tant que y'a des trucs dans la grille
    grille.removeChild(grille.firstChild)
    //on retire tous les éléments dans #grille
  }


  for (var i = 0; i < taille; i++) {
    // pour chaque ligne
    let row = grille.insertRow(i); //on insère une ligne en HTML
    for (var j = 0; j < taille; j++) {
      //pour chaque colonne
      let cell = row.insertCell(j);
      //on insère une colonne en HTML et donc une case

      nombreCases++; //on augemente le nombre de cases

      var mine = document.createAttribute("possedeMine");
      // on crée un attribut "possedemine"
      mine.value = "false"; // faux par défaut 
      cell.setAttributeNode(mine); // et on l'ajoute à la case


      var mine = document.createAttribute("id"); //on crée l'id de la case 
      mine.value = i + "." + j;
      // sous le format #bouton[ligne].[colonne]
      // 1re ligne/case = 0, pas 1
      cell.setAttributeNode(mine); // on l'ajoute à la case


      //Si on clique sur une case
      cell.onclick = function (e, type = "normal") {
        console.log("Work on " + this.id)
        console.log("mine? " + this.getAttribute('possedemine'));


        if (this.className == "flag") {
          // we don't do anything if the cell is flagged
        } else if (this.getAttribute('possedemine') == "true" && type != "sim") { // If the cell is a bomb
       
          gameOver(); // on affiche les bombes 
          this.className = "bombDiscovered"; // we put the clicked bomb in red

          alert("GAME OVER") // on affiche GAME OVER

        } else if (this.className == undefined || this.className == '') {
          //si la case n'a pas déja été cliquée

          let classeBouton = bombesAdjacentes(this.id.split("."))
          // on récupère le nombre de cases adjacentes
          this.classList.add(classeBouton); // on ajoute la classe "clicked" à la case

          // et on l'assigne à la case

          if (classeBouton == "empty") { // si la case est vide
            //on révèle les cases autour car ce n'est pas des bombes 

            let ligne = parseInt(this.id.split(".")[0], 10);
            let colonne = parseInt(this.id.split(".")[1], 10);

            console.log(ligne + " " + colonne)

            for (var i = Math.max(ligne - 1, 0); i <= Math.min(ligne + 1, taille - 1); i++) {
              for (var j = Math.max(colonne - 1, 0); j <= Math.min(colonne + 1, taille - 1); j++) {
                //pour chaque case autour
                console.log("Simulation de clic sur #" + i + '.' + j)
                console.log(document.getElementById(i + '.' + j).className)

                var caseContour = document.getElementById(i + '.' + j);
                if (typeof caseContour.onclick == "function") {
                  // si il y a une fonction quand on clique dessus
                  caseContour.onclick.apply(caseContour); // simul de clic
                }
              }
            }
          }

        }
        FinDePartie(); // on regarde si la partie est gagnée
      };


      //Si on clique droit sur une case
      cell.oncontextmenu = function () {
        console.log("clic droit de " + this.id)
        this.classList.toggle("flag");
        // on lui toggle la class flag
        // qui change l'image en drapeau si elle l'a pas (et inversement si elle l'a)
        return false; // on désactive le menu de clic droit par défaut
      };
    }
  }
  ajouterMines(value, taille); // à la fin de la génération du tableau on ajoute les mines


}

function nouvellePartie() {
  var secondes = 0;
  var minutes = 0;
  var nombreCases = 0;
  var taille = 0;
  // launching the timer
  chronoStart();
  // 2023 ADDITION: switching the confetti.js library to a new one
  // confetti.stop(); 

  genererGrille(document.getElementById("selectionDifficulte").value);
}

// 2023 ADDITION: we bind the function to the button instead of using onclick in HTML
document.getElementById("commencerPartie").onclick = nouvellePartie; 

function ajouterMines(value, taille) {
  let nombreBombes = 0;
  switch (value) {
    // on met en place le nombre de bombes selon la difficulté
    case '0':
      nombreBombes = 10;
      break;

    case '1':
      nombreBombes = 40;
      break;

    case '2':
      nombreBombes = 100;
      break;

    case '3':
      nombreBombes = 250;
      break;

    default:
      nombreBombes = 10;
      break;

  }

  // pour le nombre de bombes
  for (var i = 0; i < nombreBombes; i++) {

    do {
      var row = Math.floor(Math.random() * taille);
      var col = Math.floor(Math.random() * taille);
    } while ((listeCasesMines.includes(row + "." + col)));
    listeCasesMines.push(row + "." + col);

    // on génère des coordonnées aléatoires

    var cell = grille.rows[row].cells[col];
    //console.log(cell);
    cell.setAttribute("possedeMine", "true");
    //on met l'attribut "possedemine" a true pour cette case
  }

  console.log(listeCasesMines);

}


function bombesAdjacentes(coordCellule) {
  console.log(coordCellule)

  let ligne = parseInt(coordCellule[0], 10);
  let colonne = parseInt(coordCellule[1], 10);
  let compteurBombes = 0;

  // pour les 8 cases autour de celle envoyées
  // regarde l'attribut "possedemine"
  // si "true", compteurBombes++;

  for (var i = Math.max(ligne - 1, 0); i <= Math.min(ligne + 1, taille - 1); i++) {
    for (var j = Math.max(colonne - 1, 0); j <= Math.min(colonne + 1, taille - 1); j++) {
      if (grille.rows[i].cells[j].getAttribute("possedeMine") == "true") {
        compteurBombes++;
      }
    }
  }

  //console.log(grille.rows[coordCellules[0]].cells[coordCellules[1]]);

  console.log("vérif bombesAdjacentes sur " + coordCellule + " " + compteurBombes + " bombes");
  return classes[compteurBombes]; // return le nom de la classe correspondant au 
}

function FinDePartie() {
  for (var i = 0; i <= (taille - 1); i++) {
    for (var j = 0; j <= (taille - 1); j++) {
      if (grille.rows[i].cells[j].getAttribute('possedeMine') == "false") {
        if (!classes.includes(grille.rows[i].cells[j].className))

          // si une seule case bombe a été cliquée
          return false;
      }
    }
  }

  // si aucune case bombe n'a été cliquée

  clearInterval(timer); // on arrête l'attente

  // we disable the click on the cells
  document.querySelectorAll('td').forEach(function(td) {
    // 2023 ADDITION: we clone the cell to remove the event listener
    td.parentNode.replaceChild(td.cloneNode(true), td);
  }); 
  
  //confetti.start() // on lance les confettis
  alert("Victoire !") // on affiche victoire
}

function gameOver() {
  console.log("Game Over")
  clearInterval(timer); // on arrête l'attente

   // we disable the click on the cells
   document.querySelectorAll('td').forEach(function(td) {
    // 2023 ADDITION: we clone the cell to remove the event listener
    td.parentNode.replaceChild(td.cloneNode(true), td);
  }); 

  for (var i = 0; i <= (taille - 1); i++) {
    for (var j = 0; j <= (taille - 1); j++) {
      if (grille.rows[i].cells[j].getAttribute('possedeMine') == "true") { // si c'est une bombe
        let bombCell = grille.rows[i].cells[j];
        bombCell.className = "bomb"; // on affiche les bombes
      }
    }
  }
}