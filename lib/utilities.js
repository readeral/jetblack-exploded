export function partSearch(partString, type, data) {
    if (type === 'sku') return null;
  
    const urls = data.filter(element => element['Name'].toLowerCase().includes(partString))
    switch (urls.length) {
      case 0:
        return null;
      default:
        return urls[0];
    }
  }


 export function fetchUrl(partString, type, data, setExceptions, setMultiples) {
    const key = type === 'sku' ? 'SKU' : 'SupplierItemCode';
    const urls = data.filter(element => element[key].toLowerCase().trim() === partString.toLowerCase().trim())
    switch (urls.length) {
      case 1:
        return ['/' + urls[0]['ItemURL'], 'product']
      case 0:
        setExceptions(exceptions => [...exceptions, [partString, partSearch(partString, type, data)]])
        return ["/?rf=kw&kw=" + partString, 'search']
      default:
        setMultiples(multiples => [...multiples, [partString, urls]])
        return ["/?rf=kw&kw=" + partString, 'search']
    }
  }