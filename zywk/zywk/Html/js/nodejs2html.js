//
var zywkPrice = {};

function SetPrice(arr) {
    zywkPrice = arr;
}

function GetPrice() {
    return zywkPrice;
}

exports.SetPrice = SetPrice;
exports.GetPrice = GetPrice;