function getRatingColor(Rating) {
    return Rating >= 7 ? 'lightgreen' : (Rating >= 5 ? 'gold' : (Rating === 0 ? 'white' : 'indianred'))
}

export {
    getRatingColor
}