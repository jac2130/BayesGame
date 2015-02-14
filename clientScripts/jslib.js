// requires verify
var getCharDebug = false;

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// event.type must be keypress
function getChar(event)
{
    if (getCharDebug) {
        alert("which: " + event.which + ", keycode: " + event.keyCode + ", charCode: " + event.charCode);
    }
    if (event.which == null) {
        var retChar = String.fromCharCode(event.keyCode); // IE
        return retChar;
    } else if (event.which!=0 && event.charCode!=0) {
        var retChar = String.fromCharCode(event.which);   // the rest
        if (getCharDebug) {
            alert(retChar);
        }
        return retChar;
    } else {
        return null // special key
    }
}

function getTime()
{
    var d = new Date();
    return d.getTime();
}

var object_create = Object.create;
if (typeof object_create !== 'function') {
    object_create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

function deepCopy(src, /* INTERNAL */ _visited)
{
    if (src == null || typeof(src) !== 'object') {
        return src;
    }

    // Initialize the visited objects array if needed
    // This is used to detect cyclic references
    if (_visited == undefined){
        _visited = [];
    }
    // Otherwise, ensure src has not already been visited
    else {
        var i, len = _visited.length;
        for (i = 0; i < len; i++) {
            // If src was already visited, don't try to copy it, just return the reference
            if (src === _visited[i]) {
                return src;
            }
        }
    }

    // Add this object to the visited array
    _visited.push(src);

    //Honor native/custom clone methods
    if(typeof src.clone == 'function'){
        return src.clone(true);
    }

    //Special cases:
    //Date
    if (src instanceof Date){
        return new Date(src.getTime());
    }
    //RegExp
    if(src instanceof RegExp){
        return new RegExp(src);
    }
    //DOM Elements
    if(src.nodeType && typeof src.cloneNode == 'function'){
        return src.cloneNode(true);
    }

    //If we've reached here, we have a regular object, array, or function

    //make sure the returned object has the same prototype as the original
    var proto = (Object.getPrototypeOf ? Object.getPrototypeOf(src): src.__proto__);
    if (!proto) {
        proto = src.constructor.prototype; //this line would probably only be reached by very old browsers 
    }
    var ret = object_create(proto);

    for(var key in src){
        //Note: this does NOT preserve ES5 property attributes like 'writable', 'enumerable', etc.
        //For an example of how this could be modified to do so, see the singleMixin() function
        ret[key] = deepCopy(src[key], _visited);
    }
    return ret;
}

function deepCopyTest()
{
    var a = {'a': 1}
    var b = {'a': a}
    var c = deepCopy(b);
    var d = deepCopy(b);
    c.a.a += 1;
}

function makeObj (parentObj)
{
    return deepCopy(parentObj);
}

if (typeof require !== 'undefined')
{
    var verify = require("./verify.js");
    var verifyType = verify.verifyType;
}

Array.prototype.deleteElemByIndex = function(elemIndex)
{
    verifyType(this, "object", "inpArray");
    if (elemIndex < -this.length || elemIndex > this.length-1)
    {
        logErr("elemIndex must be inside the array. elemIndex is " + elemIndex +
                ", while array is of size " + this.length);
    }
    if (elemIndex < 0) {
        elemIndex = this.length + elemIndex;
    }
    var newArr = [];
    for (var index=0; index<this.length;index++)
    {
        if (index !== elemIndex) {
            newArr.push(this[index]);
        }
    }
    return newArr;
}

Array.prototype.deleteFirstElem = function(elem)
{
    var itemIndex = this.indexOf(elem);
    var newArr;
    if (itemIndex !== -1) {
        newArr = this.deleteElemByIndex(itemIndex);
    } else {
        logErr("val: ", elem, " not found in array ", this);
    }
    return newArr;
}

Array.prototype.deleteAllElem = function(elem)
{
    var newArr = this;
    while (newArr.indexOf(elem) !== -1)
    {
        newArr = this.deleteFirstElem(elem);
    }
    return newArr;
}

Array.prototype.contains = function (item)
{
    if (this.indexOf(item) === -1) {
        return false;
    } else {
        return true;
    }
}

var SetObj = {}

SetObj.contains = function(item)
{
    if (this.itemList.contains(item)) {
        return true;
    } else {
        return false;
    }
}

// adds item in place, but also returns obj
SetObj.add = function(item)
{
    if (!this.contains(item)) {
        this.itemList.push(item);
    }
    return this;
}

// removes in place, but also returns obj
SetObj.remove = function (item)
{
    if (this.contains(item)) {
        var itemIndex = this.itemList.indexOf(item);
        this.itemList = this.itemList.deleteElemByIndex(itemIndex);
    }
    return this;
}

// creates a new set 
SetObj.union = function (set2)
{
    var newSet = Set();
    for (var i=0;i<this.itemList.length;i++) {
        newSet.add(this.itemList[i]);
    }
    for (var i=0;i<set2.itemList.length;i++) {
        newSet.add(set2.itemList[i]);
    }
    return newSet;
}

SetObj.intersection = function (set2)
{
    var newSet = Set();
    for (var i=0; i < this.itemList.length; i++) {
        if (set2.contains(this.itemList[i])) {
            newSet.add(this.itemList[i]);
        }
    };
    return newSet;
}

function Set(alist)
{
    if (typeof alist === 'undefined') {
        return Set([]);
    } else {
        var set = Object.create(SetObj);
        set.itemList = alist;
        return set;
    }
}

function setTest ()
{
    var a = Set([1,2,3]);
    a.add(4);
    a.add(9);
    a.remove(4);
    a.remove(8);
    var b = Set([4,5,3]);
}

if (typeof module !== 'undefined') {
    module.exports = {
        Set: Set,
    }
}

function range(numElems)
{
    verifyType(numElems, "number", "numElems");
    var rangeArr = [];
    for (var i=0; i < numElems; i++) {
        rangeArr.push(i);
    };
    return rangeArr;
}
