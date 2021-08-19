import sortBy from 'lodash.sortby'

// фигово...
const CALC_METHOD_MEDIAN = 'median'

function filterAndSort(_mods, filters, sortType, ratingCalcMethod) {
  console.time('filter')

  let mods = _mods

  function filterMods(filterFn) {
    mods = mods.filter(filterFn)
  }

  if (filters.platforms.size) {
    filterMods(function(mod) {
      return filters.platforms.has(mod.Platform)
    })
  }

  if (filters.years.size) {
    filterMods(function(m) {
      return filters.years.has(m.ReleaseDate.slice(6))
    })
  }

  if (filters.tags.size) {
    filterMods(function(mod) {
      let find = 0
      mod.Tags.forEach(function(tag) {
        if (filters.tags.has(tag)) {
          find++
        }
      })
      return find === filters.tags.size
    })
  }

  if (filters.review) {
    filterMods(function(mod) {
      return mod.Review
    })
  }

  if (filters.video) {
    filterMods(function(mod) {
      return mod.Video
    })
  }

  if (filters.guide) {
    filterMods(function(mod) {
      return mod.Guide
    })
  }

  console.timeEnd('filter')

  console.time('sort')

  // Сортировать лучше в конце уже отфильтрованный список.
  if (sortType !== 'Date') {
    const modsClone = [...mods]
    modsClone.reverse()
    let field
    if (sortType === 'Rating') {
      field = ratingCalcMethod === CALC_METHOD_MEDIAN ? 'MedianRating' : 'Rating'
    } else {
      field = sortType
    }
    mods = sortBy(modsClone, field).reverse()
  }
  console.timeEnd('sort')

  return mods
}

export {
  filterAndSort
}