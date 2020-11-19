// ESPECIALLY ALL THE FUNCTIONS AND METHODS TO WRITE HTML CODE WITH JAVASCRIPT.
// AND ALSO ALL TOOLS THAT MAKE LIFE EASIER, ESPECIALLY AJAX ETC.


// HTML HANDLING
Element.prototype.addE = function(eventName, listenerFunction, capture){
   if(this.attachEvent){ // if IE
      this.attachEvent("on" + eventName, listenerFunction);
   }
   else{
      // we want 'capture' to default to 'true', while it usually defaults to 'false'
      this.addEventListener(eventName, listenerFunction, capture !== false ? true : false);
   }
   return this;
};
Element.prototype.triggerE = function(eventName, options){
   var event;
   if(window.CustomEvent){
      event = new CustomEvent(eventName, options);
   }
   else{
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventName, true, true, options);
   }
   this.dispatchEvent(event);
};
Element.prototype.appendX = function(object){
   function appendItRecursively(elem, parent){
      if(Array.isArray(elem)){
         elem.forEach(function(subElem){
            appendItRecursively(subElem, parent);
         });
      }
      else if(typeof(elem) == 'object' && typeof(elem.tag) == 'string'){
         var a = document.createElement(elem.tag.toUpperCase());

         for(var k of Object.keys(elem)){
            if(k == 'events'){
               console.warn("Method appendX: 'event' key is obsolete.");
            }
            else if(typeof(elem[k]) == 'function'){ // click, mouseover, etc.
               a.addE(k, elem[k]);
               if(k == 'append'){
                  a.triggerE('append');
               }
            }
            else if(k == 'style' && typeof(elem[k]) == 'object'){
               for(var f of Object.keys(elem[k])){
                  a.style[f] = elem[k][f];
               }
            }
            else if(k == 'classes'){
               console.error("Method appendX: old convention: 'classes' is deprecated, use 'class' instead.");
            }
            else if(k == 'class' && (Array.isArray(elem[k]) || typeof(elem[k]) == 'string')){
               if(typeof(elem[k]) == 'string'){
                  elem[k] = elem[k].split(' ');
               }
               for(var i = 0; i < elem[k].length; i++){
                  if(typeof(elem[k][i]) == 'string' && elem[k][i].trim() != ''){
                     if(elem[k][i].trim().indexOf(' ') == -1){
                        a.classList.add(elem[k][i].trim());
                     }
                     else{
                        console.error("Method appendX: spaces have been found in a CSS class array. The classes have been discarded.");
                     }
                  }
               }
            }
            else if(k != 'tag' && k != 'kids'){
               if((k == 'checked' || k == 'disabled' || k == 'selected' || k == 'readonly') && typeof(elem[k]) == 'boolean'){
                  a[k] = elem[k];
               }
               else if(k == 'value'){ // Due to textareas' strange behaviour
                  a[k] = elem[k];
               }
               else{
                  a.setAttribute(k, elem[k]);
               }
            }
         }

         parent.appendChild(a);
         appendItRecursively(elem.kids, a); // if it does not have kids, next recursion won't do anything anyway.
      }
      else if(typeof(elem) == 'string'){
         elem = elem.split('\n');
         for(var i = 0; i < elem.length; i++){
            if(i != 0){
               var b = document.createElement('BR');
               parent.appendChild(b);
            }
            var a = document.createTextNode(elem[i]);
            parent.appendChild(a);
         }
      }
      else if(typeof(elem) == 'number'){
         var a = document.createTextNode(elem);
         parent.appendChild(a);
      }
   }
   appendItRecursively(object, this);
};
Element.prototype.delElement = function(){
   if(this.parentNode){
      this.parentNode.removeChild(this);
      return true;
   }
   else{
      return false;
   }
};
Element.prototype.delKids = function(){
   while(this.firstChild){
      this.removeChild(this.firstChild);
   }
   return this;
};






















































// MISC

function millisecondsToEnglish(input){
   // This is a rough transcription from milliseconds to English
   // The round up isn't even optimal. Who cares?

   var years = Math.floor(input/(1000*3600*24*365));
   if(years > 0) return (years + ' year' + (years == 1 ? '' : 's'));

   var months= Math.floor(input/(1000*3600*24*30.4));
   if(months > 0) return (months + ' month' + (months == 1 ? '' : 's'));

   var weeks = Math.floor(input/(1000*3600*24*7));
   if(weeks > 0) return (weeks + ' week' + (weeks == 1 ? '' : 's'));

   var days  = Math.floor(input/(1000*3600*24));
   if(days > 0) return (days + ' day' + (days == 1 ? '' : 's'));

   var hours = Math.floor(input/(1000*3600));
   if(hours > 0) return (hours + ' hour' + (hours == 1 ? '' : 's'));

   var mins  = Math.floor(input/(1000*60));
   if(mins > 0) return (mins + ' minute' + (mins == 1 ? '' : 's'));

   var secs  = Math.floor(input/(1000));
   if(secs > 0) return (secs + ' second' + (secs == 1 ? '' : 's'));

   return '0 seconds';
}
