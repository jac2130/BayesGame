
function setDefault(avar, defaultVal)
{
    if (notDefined(avar)) {
        return defaultVal;
    } else {
        return avar;
    }
}

function notDefined(avar)
{
    if (typeof avar === 'undefined') {
        return true;
    } else {
        return false;
    }
}

function notDef(avar)
{
    return notDefined(avar);
}

function isDef(avar)
{
    return !notDefined(avar);
}

// verify the type of avar and outputs an error if not the case
// atype := ["boolean" | "object" | "string" | "number"]
function verifyType(avar, atype, avarName)
{
    if (typeof avar === atype) {
        return true;
    } else {
        var varType = typeof avar;
        var errStr = 'var "' + avarName + '"' + ' has type "' + varType + 
                     '" when correct type is "' + atype + '"';
        var error = new Error(errStr);
        console.debug(error.stack);
        throw error;
    }
}

function verifyEquals(avar, aval, avarName)
{
    if (avar === aval) {
        return true;
    } else {
        var errStr = 'var "' + avarName + '"' + ' equals "' + avar + 
                     '" when the correct value is "' + aval + '"';
        var error = new Error(errStr);
        console.debug(error.stack);
        throw error;
    }
}

function verifyExists(avar, avarName)
{
    if (typeof avar === aval) {
        return true;
    } else {
        var errStr = 'var "' + avarName + '"' + ' equals "' + avar + 
                     '" when the correct value is "' + aval + '"';
        var error = new Error(errStr);
        console.debug(error.stack);
        throw error;
    }
}

function verifyTrue(avar, avarName)
{
    verifyType(avar, "boolean", avarName);
    verifyEquals(avar, true, avarName);
}

function verifyIn (attr, obj, objName)
{
    verifyType(obj, "object", objName);
    if (attr in obj) {
        return true;
    } else {
        var errStr = "Object \"" + objName + "\" should have attr " +
                     "\"" + attr + "\" but it doesn't";
        var error = new Error(errStr);
        console.debug(error.stack);
        throw error;
    }
}

function logErr(errMsg)
{
    var error = new Error(errMsg);
    console.debug(error.stack);
    throw error;
}

function testVerifyFuncs() 
{
    console.log(typeof "asdf");
    console.log(typeof 1);
    console.log(typeof {'':''});
    console.log(typeof [1,2,3]);
    console.log(typeof false);
    var a = 4;
    verifyType(a, "number", "a");
    verifyEquals(a, 5, "a");
    //console.log(new Error().stack);
    var b = setDefault(b, 4);
    console.log(b);
}

if (typeof module !== 'undefined') {
    module.exports = {
        setDefault: setDefault,
        notDefined: notDefined,
        verifyType: verifyType,
        verifyEquals: verifyEquals,
        verifyExists: verifyExists,
        verifyTrue: verifyTrue,
        verifyIn: verifyIn,
        logErr: logErr
    }
}
