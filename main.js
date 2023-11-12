import './style.less'
// 2023 ADDITION: we import the confetti.js library
import JSConfetti from 'js-confetti'

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

// 2023 ADDITION: we create a new confetti object
const jsConfetti = new JSConfetti()

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
  let origin = window.location.href.split('?')[0]; // gets the website URL without the parameters
  console.log(origin)
  let theme = getUrlParameter('theme'); // grabs the theme variable in the URL

  if (theme == "xp") { // if we were on the xp theme
    location.replace(origin) // we reload the page with the default theme
  } else {
    location.replace(origin + "?theme=xp") // we reload the page with the xp theme
  }
}
// 2023 ADDITION: we bind the function to the button instead of using onclick in HTML
document.getElementById("themeSwitcher").onclick = switchTheme;


function ajoutTemps() {

  secondes += 1; // we add one second to the counter

  if (secondes >= 60) { // if we reach 60 seconds
    secondes = 0; // we reset the seconds
    minutes++; // and we add one minute to the counter
  }

  let timestamp = String(minutes).padStart(2, '0') + ":" + String(secondes).padStart(2, '0');
  // we force the text to be 2 characters long and we add a 0 if it's not the case

  timerTexte.textContent = timestamp // we put the text in the timer div

  attente(); // and then we wait one second
}

function attente() {
  var timer = setTimeout(ajoutTemps, 1000);
  // we wait one second, then we add one second to the counter
}

function chronoStart() {
  clearInterval(timer); // we stop the timer
  attente(); // we start it again from 0
}

function genererGrille(value) {
  console.log(value) // we log the value of the difficulty
  nombreCases = 0;
  taille = 0; // we put the variables back to 0

  switch (value) {
    // we set the size of the grid according to the difficulty
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

  // we empty the grid
  while (grille.firstChild) { // while there's stuff in the grid
    grille.removeChild(grille.firstChild)
    // we remove all elements in the grid
  }


  for (var i = 0; i < taille; i++) {
    // for each line
    let row = grille.insertRow(i); // we insert a line in HTML
    for (var j = 0; j < taille; j++) {
      // for each column
      let cell = row.insertCell(j);
      // we insert a cell in HTML, thus creating a cell in the grid

      nombreCases++; // we add one to the number of cells

      var mine = document.createAttribute("possedeMine");
      // we create the attribute "possedeMine" (hasMine)
      mine.value = "false"; // false by default
      cell.setAttributeNode(mine); // and we add it to the cell


      var mine = document.createAttribute("id"); // we create the cell id
      mine.value = i + "." + j;
      // under the "x.y" format, with x being the line and y the column
      // the first cell is 0.0, the second 0.1, etc.
      cell.setAttributeNode(mine); // we add it to the cell


      // if we click on a cell
      cell.onclick = function (e, type = "normal") {
        console.log("Work on " + this.id)
        console.log("mine? " + this.getAttribute('possedemine'));


        if (this.className == "flag") {
          // we don't do anything if the cell is flagged
        } else if (this.getAttribute('possedemine') == "true" && type != "sim") { // If the cell is a bomb
       
          gameOver(); // we display the bombs
          this.className = "bombDiscovered"; // we put the clicked bomb in red

          alert("GAME OVER") // we display the game over message

          // 2023 ADDITION: we launch the confetti
          jsConfetti.addConfetti({
            emojis: ['💥','💣']
          })

        } else if (this.className == undefined || this.className == '') {
          // if the cell hasn't been clicked yet

          let classeBouton = bombesAdjacentes(this.id.split("."))
          // we get the nubmer of adjacent bombs
          this.classList.add(classeBouton); // we add the clicked class to the cell

          // if the cell is empty
          if (classeBouton == "empty") { // if the cell is empty
            // we simulate a click on all adjacent cells via recursion

            let ligne = parseInt(this.id.split(".")[0], 10);
            let colonne = parseInt(this.id.split(".")[1], 10);

            console.log(ligne + " " + colonne)

            for (var i = Math.max(ligne - 1, 0); i <= Math.min(ligne + 1, taille - 1); i++) {
              for (var j = Math.max(colonne - 1, 0); j <= Math.min(colonne + 1, taille - 1); j++) {
                // for each adjacent cell
                console.log("Simulation de clic sur #" + i + '.' + j)
                console.log(document.getElementById(i + '.' + j).className)

                var caseContour = document.getElementById(i + '.' + j);
                if (typeof caseContour.onclick == "function") {
                  // if the cell has an onclick function
                  caseContour.onclick.apply(caseContour); // we simulate a click on it
                }
              }
            }
          }

        }
        FinDePartie(); // we check if the user won
      };


      // if we right click on a cell
      cell.oncontextmenu = function () {
        console.log("clic droit de " + this.id)
        this.classList.toggle("flag");
        // we toggle the flag class
        // that will display a flag on the cell (and remove it if it's already there)
        return false; // we prevent the default context menu from appearing
      };
    }
  }
  ajouterMines(value, taille); // at the end of the grid generation, we add the bombs


}

function nouvellePartie() {
  var secondes = 0;
  var minutes = 0;
  var nombreCases = 0;
  var taille = 0;
  // launching the timer
  chronoStart();
  // 2023 ADDITION: switching the confetti.js library to a new one
  jsConfetti.clearCanvas()

  genererGrille(document.getElementById("selectionDifficulte").value);
}

// 2023 ADDITION: we bind the function to the button instead of using onclick in HTML
document.getElementById("commencerPartie").onclick = nouvellePartie; 

function ajouterMines(value, taille) {
  let nombreBombes = 0;
  switch (value) {
    // we set the number of bombs according to the difficulty
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

  // for the number of bombs
  for (var i = 0; i < nombreBombes; i++) {

    do {
      var row = Math.floor(Math.random() * taille);
      var col = Math.floor(Math.random() * taille);
    } while ((listeCasesMines.includes(row + "." + col)));
    listeCasesMines.push(row + "." + col);

    // we get a random cell

    var cell = grille.rows[row].cells[col];
    cell.setAttribute("possedeMine", "true");
    // we set the cell as having a bomb
  }

  console.log(listeCasesMines);

}


function bombesAdjacentes(coordCellule) {
  console.log(coordCellule)

  let ligne = parseInt(coordCellule[0], 10);
  let colonne = parseInt(coordCellule[1], 10);
  let compteurBombes = 0;

  /* 
  for the 8 cells around the one sent
  check the "possedemine" (hasMine) attribute
  if "true", compteurBombes++;
  */

  for (var i = Math.max(ligne - 1, 0); i <= Math.min(ligne + 1, taille - 1); i++) {
    for (var j = Math.max(colonne - 1, 0); j <= Math.min(colonne + 1, taille - 1); j++) {
      if (grille.rows[i].cells[j].getAttribute("possedeMine") == "true") {
        compteurBombes++;
      }
    }
  }

  //console.log(grille.rows[coordCellules[0]].cells[coordCellules[1]]);

  console.log("vérif bombesAdjacentes sur " + coordCellule + " " + compteurBombes + " bombes");
  return classes[compteurBombes]; // return the class corresponding to the number of bombs
}

function FinDePartie() {
  for (var i = 0; i <= (taille - 1); i++) {
    for (var j = 0; j <= (taille - 1); j++) {
      if (grille.rows[i].cells[j].getAttribute('possedeMine') == "false") {
        if (!classes.includes(grille.rows[i].cells[j].className))

          // if a single bombless cell hasn't been clicked yet
          return false;
      }
    }
  }

  // if we reach this point, it means that all bombless cells have been clicked

  clearInterval(timer); // we stop the timer

  // we disable the click on the cells
  document.querySelectorAll('td').forEach(function(td) {
    // 2023 ADDITION: we clone the cell to remove the event listener
    td.parentNode.replaceChild(td.cloneNode(true), td);
  }); 
  
  // 2023 ADDITION: we launch the confetti
  jsConfetti.addConfetti()
  alert("Victoire !") // we display the victory message
}

function gameOver() {
  console.log("Game Over")
  clearInterval(timer); // we stop the timer

   // we disable the click on the cells
   document.querySelectorAll('td').forEach(function(td) {
    // 2023 ADDITION: we clone the cell to remove the event listener
    td.parentNode.replaceChild(td.cloneNode(true), td);
  }); 

  for (var i = 0; i <= (taille - 1); i++) {
    for (var j = 0; j <= (taille - 1); j++) {
      if (grille.rows[i].cells[j].getAttribute('possedeMine') == "true") { // if the cell has a bomb
        let bombCell = grille.rows[i].cells[j];
        bombCell.className = "bomb"; // we display the bomb
      }
    }
  }
}