// THE CODE OF THE SRS ALGORITHM, AND THE STORAGE
function VocabTrainer(){
   this.decks = new Array();
}
VocabTrainer.prototype.pushDeck = function(deck){
   if(this.alreadyExistFileID(deck.fileID)){
      alert("Error: the deck could not be created because its fileID was already existing.");
   }
   else{
      this.decks.push(deck);
   }
};
VocabTrainer.prototype.removeDeck = function(deck_id){
   this.decks.splice(deck_id, 1);
};
VocabTrainer.prototype.alreadyExistFileID = function(file_id){
   var is_unique = false;
   for(var i of Object.keys(this.decks)){
      if(this.decks[i].fileID == file_id){
         is_unique = true;
         break;
      }
   }
};
VocabTrainer.prototype.storeDeck = function(deck_id){
   try{
      localStorage.setItem("deck/"+this.decks[deck_id].fileID, JSON.stringify(this.decks[deck_id]));
   }
   catch(e){
      alert("Error: there was an error and the deck could not be saved to the localStorage.");
   }
};
VocabTrainer.prototype.loadDeck = function(file_id){
   // CAUTION: In the current logic, all decks have to be loaded so that this.alreadyExistFileID can work properly.
   if(this.alreadyExistFileID(file_id)){
      alert("Error: the deck could not be properly loaded from the localStorage because it already was.");
   }
   else{
      var d = JSON.parse(localStorage.getItem("deck/"+file_id));

      if(!!d){
         // Reassign prototypes ^^'
         Object.setPrototypeOf(d, Deck.prototype);
         for(var i of Object.keys(d.entries)){
            Object.setPrototypeOf(d.entries[i], Card.prototype);
         }

         this.pushDeck(d);
      }
      else{
         alert("Error: the deck could not be found in the localStorage or failed to be parsed.");
      }
   }
};
VocabTrainer.prototype.loadAllDecks = function(){
   for(var i of Object.keys(localStorage)){
      if(i.indexOf("deck/") == 0){
         this.loadDeck(i.substring("deck/".length));
      }
   }
};
VocabTrainer.prototype.removeDeckFromStorage = function(file_id){
   alert("|@# This function was not implemented yet");
};

function Deck(name, description){
   this.name        = name;
   this.description = description;
   this.fileID      = Math.random().toString(36).substring(2);
   this.since       = Date.now();
   this.lastmodif   = Date.now();

   this.entries     = new Array();
}

Deck.prototype.addEntry = function(faceA, faceB){
   this.entries.push(new Card(faceA, faceB));
};
Deck.prototype.editEntry = function(entry_id, faceA, faceB){
   this.entries[entry_id].faceA = faceA;
   this.entries[entry_id].faceB = faceB;
};
Deck.prototype.removeEntry = function(entry_id){
   this.entries.splice(entry_id, 1);
};

function Card(faceA, faceB){
   // |@# it would be nice to have a dynamical amount of sides instead of just A and B
   // |@# it would be nice to have specifications about which side is what. E.g. details, description, examples, url, ...
   this.faceA       = faceA;
   this.faceB       = faceB;
   this.isActive    = true;
   this.isStarred   = false;
   this.since       = Date.now();

   // This factor (noted "L" in the math part) determines how well you know the card. It is this
   // factor that multiplies the initial learning intervals in order to determine the intervals that
   // should show up when the card is revised.
   this.learnFactor = 1;

   // This contains the timestamp of when the card shall come back.
   this.comeback = Date.now()-1000;

   //this.history = [];   // This is not used for now, but will (someday)
}

const PERFECT = 3;
const GOOD    = 2;
const MIDDLE  = 1;
const OUPS    = 0;
Card.prototype.getIntervals = function(goodness){
   var initialIntervals  = 1000*[5*60, 4*3600, 2*24*3600, 8*24*3600];
   return initialIntervals[goodness] * this.learnFactor;
};
Card.prototype.getLearnFactorAdjust = function(goodness){
   // ACTUALLY THIS FUNCTION HAS NOTHING TO DO WITH THE CARDS, THE OUTPUT IS ALWAYS THE SAME.
   var learnFactorAdjust = [1/3, 1/Math.pow(3, 1/2), Math.pow(2, 1/8), 2];
   return learnFactorAdjust[goodness];
};
Card.prototype.revise = function(goodness){
   this.comeback      = Date.now() + Math.round(this.getIntervals(goodness) * (0.9+0.2*Math.random()));
   this.learnFactor  *= this.getLearnFactorAdjust(goodness);
};




















// Global variables
var vt = new VocabTrainer();
// Initialisation
vt.loadAllDecks();



// testing:
vt.pushDeck(new Deck("titre0", "description"));
vt.decks[0].addEntry("a1","b1");
vt.decks[0].addEntry("a2","b2");
vt.decks[0].addEntry("a3","b3");
vt.pushDeck(new Deck("titre1", "description"));
vt.decks[1].addEntry("a1","b1");
vt.decks[1].addEntry("a2","b2");
vt.decks[1].addEntry("a3","b3");
vt.pushDeck(new Deck("titre2", "description"));
vt.decks[2].addEntry("a1","b1");
vt.decks[2].addEntry("a2","b2");
vt.decks[2].addEntry("a3","b3");
