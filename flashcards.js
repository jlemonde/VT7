function Deck(name, secondline, description){
   this.name        = name;
   this.id          = undefined;
   this.secondline  = secondline;
   this.description = description;
   this.since       = Date.now();
   this.lastmodif   = Date.now();

   this.entries     = new Array();
}

Deck.prototype.addEntry = function(faceA, faceB){
   this.entries.push(new Card(faceA, faceB));
};

function Card(faceA, faceB){
   this.faceA       = faceA;
   this.faceB       = faceB;
   this.id          = undefined;
   this.isActive    = true;
   this.isStarred   = false;
   this.since       = Date.now();
}
