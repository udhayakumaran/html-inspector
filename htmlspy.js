(function() {
  if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault=function() {
      this.returnValue=false;
    };
  }
  if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation=function() {
      this.cancelBubble=true;
    };
  }
  if (!Element.prototype.addEventListener) {
    var eventListeners=[];
    
    var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var self=this;
      var wrapper=function(e) {
        e.target=e.srcElement;
        e.currentTarget=self;
        if (listener.handleEvent) {
          listener.handleEvent(e);
        } else {
          listener.call(self,e);
        }
      };
      if (type=="DOMContentLoaded") {
        var wrapper2=function(e) {
          if (document.readyState=="complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange",wrapper2);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
        
        if (document.readyState=="complete") {
          var e=new Event();
          e.srcElement=window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on"+type,wrapper);
        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
      }
    };
    var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
      var counter=0;
      while (counter<eventListeners.length) {
        var eventListener=eventListeners[counter];
        if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
          if (type=="DOMContentLoaded") {
            this.detachEvent("onreadystatechange",eventListener.wrapper);
          } else {
            this.detachEvent("on"+type,eventListener.wrapper);
          }
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener=addEventListener;
    Element.prototype.removeEventListener=removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener=addEventListener;
      HTMLDocument.prototype.removeEventListener=removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener=addEventListener;
      Window.prototype.removeEventListener=removeEventListener;
    }
  }
})();

function preventDefaultAction(e) {
  e.preventDefault();
  e.stopPropagation();
}

(function (w, d, ua) {
    prevElement = null;
    var notelistener = function (e) {
  	document.body.addEventListener("click", preventDefaultAction);

        var elem = e.target || e.srcElement;
        if (prevElement != null) {
            prevElement.classList.remove(ua.pinClass);
        }
        elem.classList.add(ua.pinClass);
        prevElement = elem;
    };
    document.addEventListener('mousemove', notelistener, false);

    var css = document.createElement('style');
    css.setAttribute('type', 'text/css');
    css.setAttribute('id', 'noteCSS');
    css.innerHTML = '.'+ua.pinClass+' { background-color: #BCD5EB !important; border: 2px solid #0077CC !important; opacity: 0.5; }';
    document.body.appendChild(css)

    document.body.onclick = function (e) {
		document.body.addEventListener("click", preventDefaultAction);

        var clickedEl = window.event ? event.srcElement : e.target;
        while (clickedEl != null) {
            if (clickedEl.className && clickedEl.className.indexOf(ua.pinClass) != -1) {

                var getElementsByClassName = function (className, tag, elm) {
                    if (document.getElementsByClassName) {
                        getElementsByClassName = function (className, tag, elm) {
                            elm = elm || document;
                            var elements = elm.getElementsByClassName(className),
                                nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
                                returnElements = [],
                                current;
                            for (var i = 0, il = elements.length; i < il; i += 1) {
                                current = elements[i];
                                if (!nodeName || nodeName.test(current.nodeName)) {
                                    returnElements.push(current);
                                }
                            }
                            return returnElements;
                        };
                    } else if (document.evaluate) {
                        getElementsByClassName = function (className, tag, elm) {
                            tag = tag || "*";
                            elm = elm || document;
                            var classes = className.split(" "),
                                classesToCheck = "",
                                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null,
                                returnElements = [],
                                elements,
                                node;
                            for (var j = 0, jl = classes.length; j < jl; j += 1) {
                                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
                            }
                            try {
                                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
                            } catch (e) {
                                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
                            }
                            while ((node = elements.iterateNext())) {
                                returnElements.push(node);
                            }
                            return returnElements;
                        };
                    } else {
                        getElementsByClassName = function (className, tag, elm) {
                            tag = tag || "*";
                            elm = elm || document;
                            var classes = className.split(" "),
                                classesToCheck = [],
                                elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag),
                                current,
                                returnElements = [],
                                match;
                            for (var k = 0, kl = classes.length; k < kl; k += 1) {
                                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
                            }
                            for (var l = 0, ll = elements.length; l < ll; l += 1) {
                                current = elements[l];
                                match = false;
                                for (var m = 0, ml = classesToCheck.length; m < ml; m += 1) {
                                    match = classesToCheck[m].test(current.className);
                                    if (!match) {
                                        break;
                                    }
                                }
                                if (match) {
                                    returnElements.push(current);
                                }
                            }
                            return returnElements;
                        };
                    }
                    return getElementsByClassName(className, tag, elm);
                };

                var thisElem = getElementsByClassName(ua.pinClass)[0];

                if (thisElem.innerHTML == "") {
                    var thisNotedElemsHTML = (thisElem.outerHTML || document.createElement("div")
                        .appendChild(thisElem.cloneNode(true))
                        .parentNode
                        .innerHTML).replace(/^\s+|\s+$/g, "");
                } else {
                    var thisNotedElemsHTML = thisElem.innerHTML;
                }

                document.removeEventListener('mousemove', notelistener, false);

                var f = document.createElement("form");
                f.setAttribute('method', "post");
                f.setAttribute('action', "http://localhost/testnote/index.php");
                f.setAttribute('id', ua.pinFrmID);
                f.setAttribute('target', "_blank");
                f.innerHTML = '<textarea name="'+ua.pinEleCont+'" style="display:none;visibility:0;">' + thisNotedElemsHTML + '</textarea><input type="hidden" name="'+ua.pinTitle+'" value="' + document.title + '" />';

                document.body.appendChild(f);
                document.getElementById(ua.pinFrmID).submit();

                var remveClass = Array.prototype.slice.call(document.getElementsByClassName(ua.pinClass), 0);
                for (var i = 0, l = remveClass.length; i < l; i++)
                    remveClass[i].setAttribute('class', remveClass[i].getAttribute('class').replace(new RegExp('(^|[^\w])' + ua.pinClass + '([^\w]|$)', 'g'), ' '));
            }
            clickedEl = clickedEl.parentNode;
            // Need to check
            // var noteFormEle = document.getElementById('noteform');
            // noteFormEle.parentNode.removeChild(noteFormEle);
            // var noteCSS = document.getElementById('noteCSS');
            // noteCSS.parentNode.removeChild(noteCSS);
            // var noteScript = document.getElementById('noteScript');
            // noteScript.parentNode.removeChild(noteScript);
        }
		setTimeout(function(){document.body.removeEventListener("click", preventDefaultAction);},1000)
    }
})(window, document, {
    pinClass: "note_" + (new Date).getTime(),
    pinFrmID: "noteFrm_" + (new Date).getTime(),
    pinEleCont: "noteContainer",
    pinTitle: "noteTitle"
});
