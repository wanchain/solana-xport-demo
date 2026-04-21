function hexTrip0x(hexs) {
    if (hexs && (0 == hexs.indexOf('0x'))) {
        return hexs.slice(2);
    }
    return hexs;
}

function hexAdd0x(hexs) {
    if (hexs && (0 != hexs.indexOf('0x'))) {
        return '0x' + hexs;
    }
    return hexs;
}

module.exports = {
    hexAdd0x, hexTrip0x
}