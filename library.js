// ESPECIALLY ALL THE FUNCTIONS AND METHODS TO WRITE HTML CODE WITH JAVASCRIPT.
// AND ALSO ALL TOOLS THAT MAKE LIFE EASIER, ESPECIALLY AJAX ETC.


// HTML HANDLING
Element.prototype.addE = function(eventName, listenerFunction, capture){
	if(this.attachEvent){ // if IE
		this.attachEvent("on" + eventName, listenerFunction);
	}
	else{
		// we want 'capture' to default to 'false' so that it bubbles
		// capturing means the parent element will be triggered first;
		// on the other hand, bubbling (the opposite) means the child will be triggered first
		this.addEventListener(eventName, listenerFunction, capture !== true ? false : true);
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
					else if(elem[k] !== undefined && elem[k] !== null){
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


























// AJAX
/* Utilisation : params est string optionnel, sa présence rendra la méthode de type post.
	Il y a un troisièem paramètre à la fonction ajax : elle sert à insérer un texte alternatif qui ne sert à rien.
			ajax('page.html', params).then(function(r){
				// Code ici ; le paramètre r contient la réponse.
			}, ajaxErr); */
var ajaxReqList = [];
function ajax(url, params, alt){
	if(!navigator.onLine){
		return Promise.reject("offline");
	}
	if(typeof(params) == 'object'){
		if(params.constructor.name === "FormData"){
			// we are good so.
			console.log("a FormData was passed to ajax");
		}
		else{
			var p = '';
			for(let k of Object.keys(params)){
				p += k + '=' + encodeURIComponent(params[k]) + '&';
			}
			params = p.substr(0,p.length-1);
		}
	}
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();

		xhr.onloadstart = function(event){
			ajaxReqList.push([xhr, url, params || undefined, alt || undefined, Date.now()]);
			if(alt){
				console.info('AJAX: ' + alt + '...');
			}
			iniAjaxLoader();
		};
		xhr.onload = function(event){
			if(xhr.status==200){
				resolve(xhr.responseText);
			}
			else{
				reject(event);
			}
		};
		xhr.onabort = function(event){
			reject(event);
		};
		xhr.onerror = function(event){
			reject(event);
		};
		xhr.onloadend = function(event){
			var l = -1;
			for(var i = 0; i < ajaxReqList.length; i++){
				if(ajaxReqList[i][0] == xhr){
					l = i;
					break;
				}
			}
			if(l != -1){
				ajaxReqList.splice(l, 1);
			}
			iniAjaxLoader();
		};

		if(!params){
			xhr.open("GET", url, true);
			xhr.send(null);
		}
		else{
			xhr.open("POST", url, true);
			if(typeof params == 'object' && params.constructor.name === "FormData"){
				//xhr.setRequestHeader("Content-type", "multipart/form-data");
			}
			else{
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
			xhr.send(params);
		}
	});
}
function ajaxErr(event){
	if(typeof(event) == "string"){
		if(event == "offline"){
			alert('Offline...');
			//vbr(100);
		}
	}
	else if(event.type == "abort"){
		alert("The connection to the server was aborted...");
	}
	else if(event.type == "error"){
		alert("The connection to the server had an error...");
	}
	else if(event.type == "load"){
		var v = {
			"403":" (Forbidden)",
			"404":" (Not found)",
			"408":" (Resquest Timeout)",
			"500":" (Internal Server Error)",
			"503":" (Service Unavailable)"
		};
		var w = "HTTP Status " + event.target.status + (v[event.target.status] || '') + '...';
		alert("The connection to the server could not happen:\n" + w);
	}
	return Promise.reject(event);
}
function iniAjaxLoader(){
	var l = ajaxReqList;
	var n = l.length;
	var q = [];
	for(var i = 0; i < n; i++){
		q[q.length] = {
			tag:'div',
			class:'ajaxabortbox',
			kids:[
				{
					tag:'span',
					class:'ajaxabortbtn',
					i:i,
					click:function(){
						l[Number(this.getAttribute('i'))][0].abort();
					}
				}, {
					tag:'span',
					class:'ajaxaborttxt',
					kids:String(l[i][3])
				}
			]
		};
	}
	if(!document.getElementById('ajaxloads')){
		document.body.appendX({
			tag:'div',
			id:'ajaxloads',
			kids:[
				{
					tag:'div',
					id:'ajaxloads_bg'
				}, {
					tag:'div',
					id:'ajaxloads_n',
					click:function(){
						document.getElementById('ajaxloads_l').classList.toggle('hidden');
					},
					kids:n
				}, {
					tag:'div',
					id:'ajaxloads_l',
					class:'hidden',
					kids:q
				}
			]
		});
	}
	else if(n >= 1){
		document.getElementById('ajaxloads_n').delKids().appendX(n);
		document.getElementById('ajaxloads_l').delKids().appendX(q);
	}
	else{
		if(document.getElementById('ajaxloads')){
			document.getElementById('ajaxloads').delElement();
		}
	}
}
























// MISC

function resizeTextarea(htmlelement) {
  htmlelement.style.height = '0px';
  htmlelement.style.height = (htmlelement.offsetHeight-htmlelement.clientHeight+htmlelement.scrollHeight-8)+'px';
  // the 8 represents border+padding
}

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

function previewString(str, len = 36){
	// First thing, we only keep the first line
	var s = str.split('\n');
	//var t = s.length > 1 ? '↵' : '';
	var t = '';
	s = s[0];
	if(s.length > len-t.length){
		s = s.substr(0, len-t.length-1) + '…';
	}
	return s+t;
}

Array.prototype.countOccurrences = function(v){
   var i = 0, j = 0;
   while(this.indexOf(v, i) >= i){
      i = this.indexOf(v, i) + 1;
      j++;
   }
   return j;
};
String.prototype.countOccurrences = function(v){
   var i = 0, j = 0;
   while(this.indexOf(v, i) >= i){
      i = this.indexOf(v, i) + 1;
      j++;
   }
   return j;
};





//FILES
function saveAsFile(filename,text){
   filename = filename.replace(/[^A-Za-z0-9.-_]/gi,'_');
   var pom = document.createElement('a');
   pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
   pom.setAttribute('download', filename);

   if(document.createEvent){
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
   }
   else{
      pom.click();
   }
}
