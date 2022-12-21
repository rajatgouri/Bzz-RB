let Utils = {}

const fns = {
    'filter': (value, key, filterQuery) => {
        let values = value

        if (values.indexOf('null') > -1  || (values.indexOf(null) > -1) || values.indexOf(0) > -1 ||  values.indexOf('') > -1) {
            values.push('')
            values =values.filter(v=> v != null)
            valueQuery = values.map(v => ("'" + v.toString().replace(/'/ig, "''") + "'"))
            filterQuery +=  values   !== null ? "([" + key + "] IN (" + valueQuery + ") or " : "";
            filterQuery +=   "[" + key  +'] IS NULL) and '
            return (filterQuery)

        } else {

            valueQuery = values.map(v => ("'" + v.toString().replace(/'/ig, "''") + "'"))
            if (values.length > 0) {
                filterQuery += value !== null ? "[" + key + "] IN (" + valueQuery + ") and " : "";
                return (filterQuery)

            }
        }

    },
    'boolean': (value, key,filterQuery) => {
        let values = value;
        if (values.length < 2 && values[0] == 0) {
            filterQuery += "[" + key + "] NOT IN ( '' )  and " 
            return (filterQuery)

        } else if ((values.length < 2 && values[0] == 1)) {
            filterQuery += "(["+ key + "] IN ( '' ) or ["+ key+ "]  IS NULL) and " ;
            return (filterQuery)

        } 

    },
    'date': (value, key,filterQuery) => {
        
            if(value.length ==2) {
                 value = value.toString().replace(/'/ig, "''").split(',')

                filterQuery += value !== null ? "(CAST ([Denial Date] as Date)  BETWEEN FORMAT(TRY_CAST('"+ value[0] +"' as date),'yyyy-MM-dd')  and FORMAT(TRY_CAST('"+ value[1] +"'  as date),'yyyy-MM-dd'))" + " and " : "";

            } else {
                value = value.toString().replace(/'/ig, "''")

        filterQuery += value !== null ? ('CAST ([' + key + '] as Date) ') + " =  FORMAT(TRY_CAST('"+ value +"' as date),'yyyy-MM-dd')" + " and " : "";
    }

        // filterQuery += value !== null ? (value.length > 1 ? 'CAST([' + key + '] AS DATE)'  : "[" + key + "]") + " =  CAST('" + value + "' AS DATE)" + " and " : "";
        return (filterQuery)
    },
    'range': (value, key,filterQuery) => {
        value = value.toString().replace(/'/ig, "''")
        
        // filterQuery += value !== null ? (value.length > 1 ? 'CAST([' + key + '] AS DATE)'  : "[" + key + "]") + " =  CAST('" + value + "' AS DATE)" + " and " : "";
        return (filterQuery)
    },
    'datetime': (value, key,filterQuery) => {
        value = value.toString().replace(/'/ig, "''")
        filterQuery += value !== null ? ('CAST ([' + key + '] as DateTime) ') + " =  FORMAT(TRY_CAST('"+ value +"' as datetime),'yyyy-MM-dd hh:mm:ss')" + " and " : "";

        // filterQuery += value !== null ? (value.length > 1 ? 'CAST([' + key + '] AS DATE)'  : "[" + key + "]") + " =  CAST('" + value + "' AS DATE)" + " and " : "";
        return (filterQuery)
    },
    
    'search': (value, key,filterQuery) => {
        value = value.toString().replace(/'/ig, "''")

        filterQuery += value !== null ? (value.length > 1 ? '[' + key + ']' : "["+key+ "]") + " Like '%" + value + "%' and " : "";  
        return (filterQuery)
    }
}

Utils.getFilters = async (keys, customSwitch) => {
    
    return new Promise(async (resolve, reject) => {
        filterQuery = '';

        let c = Object.keys(keys)

        if(c.length ==0) {
            resolve('')
            return
        }
        for ( key in keys) {

            if (keys[key]['value'] != null && keys[key]['value'].length > 0 ) {


                for  (const { condition, value, type } of customSwitch) {
                    if (key == condition ) {
                        let query 

                        if(type == 'date'  ) {
                            query = await fns['date'](value, key, filterQuery)
                        } else if (  type == 'datetime') {
                            query = await fns['datetime'](value, key, filterQuery)
                        } else if (  type == 'boolean') {
                            query = await fns['boolean'](value, key, filterQuery)
                        }
                         else if(type == 'search') {
                            query = await fns['search'](value, key, filterQuery)
                        } else {
                            query = await fns['filter'](value, key, filterQuery)
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


