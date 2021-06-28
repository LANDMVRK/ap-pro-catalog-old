function getBase(str) {
  const tmp = str.split('/')
  return tmp[tmp.length - 1]
}

export {
  getBase
}