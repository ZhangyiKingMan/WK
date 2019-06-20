
function addClass(elem, className) {
    elem.className += " " + className;
}
function hasClass(elem, className) {
    var reg = new RegExp('(\\s|^)' + className + '\\s|$');
    return reg.test(elem.className);
}
function delClass(elem, className) {
    if (hasClass(elem, className)) {
        elem.className = "divForm";
    }
}
