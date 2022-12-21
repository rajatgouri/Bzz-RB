let Utils = {}

const fns = {
    'normal': (key, keys, filterQuery) => {
        let values = keys[key];

        if (values.indexOf('null') > -1 || values.indexOf(0) > -1) {
            values.push('')
            valueQuery = values.map(v => ("'" + v + "'"))
            filterQuery +=  keys[key]   !== null ? "([" + key + "] IN (" + valueQuery + ") or " : "";
            filterQuery +=   "[" + key   +'] IS NULL) and '
            return (filterQuery)

        } else {

            valueQuery = values.map(v => ("'" + v + "'"))
            if (values.length > 0) {
                filterQuery += keys[key] !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                return (filterQuery)

            }
        }

    },
    'boolean': (key, keys,filterQuery) => {
        let values = keys[key];
        if (values.length < 2 && values[0] == 0) {
            filterQuery += "[" + key + "] NOT IN ( '' )  and " 
            return (filterQuery)

        } else if ((values.length < 2 && values[0] == 1)) {
            filterQuery += "(["+ key + "] IN ( '' ) or Notes IS NULL) and " ;
            return (filterQuery)

        } 

    },
    'default': (key, keys,filterQuery) => {
        filterQuery += keys[key] !== null ? (key.split(" ").length > 1 ? '[' + key + ']' : "[" + key + "]") + " Like '%" + keys[key] + "%' and " : "";  
        return (filterQuery)
    }
}

Utils.getFilters = async (keys, customSwitch) => {
    
    return new Promise(async (resolve, reject) => {
        filterQuery = '';

        let c = Object.keys(keys)
        for ( key in keys) {
            if (keys[key] != null && keys[key].length > 0 ) {
                for  (const { condition, fn } of customSwitch) {
                    if (key == condition ) {
                        let query 

                        
                        if(fn == 'Error'  ) {
                            query = await fns['boolean'](fn, keys, filterQuery)
                        } else if(keys[fn].length == 1) {
                            query = await fns['default'](fn, keys, filterQuery)
                        } else {
                            query = await fns['normal'](fn, keys, filterQuery)
                        }
                        
                       filterQuery = query ? query : ''
                       break;
                    } 
    
                }
            } 
            
            if (c.indexOf(key) == c.length - 1) {
                resolve(filterQuery)
            } 


        }
    })
    


}


module.exports = Utils


