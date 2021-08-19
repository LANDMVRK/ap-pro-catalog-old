export function getRatingColor(r) {
    return r >= 7 ? 'lightgreen' : (r >= 5 ? 'gold' : (r === 0 ? 'white' : 'indianred'))
}