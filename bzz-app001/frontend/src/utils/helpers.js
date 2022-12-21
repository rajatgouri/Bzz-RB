import { parse } from "querystring";
function getPageQuery() {
  parse(window.location.href.split("?")[1]);
}

/* 
 To get nested object properties.
 admin = {
    location: {
        lat: 50,
        long: 9
    }
 }

 get(admin, 'location.lat')     // 50
 get(admin, 'location.foo.bar') // undefined
*/


export function mappedUser(users) {
  return users.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null ).sort(GetSortOrder('User')).map((user) => ({EMPID: user.EMPID, name: user.Nickname, text: user.Nickname , value: user.Nickname , status: 'success'}))

}

export function GetSortOrder  (prop)  {    
  return function(a, b) {    
      if (a[prop] > b[prop]) {    
          return 1;    
      } else if (a[prop] < b[prop]) {    
          return -1;    
      }    
      return 0;    
  }    
}


export function renderCustomizedLabel (props)  {
  const { x, y, width, value } = props;
  const radius = 10;

  return (
    <g>
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#000000"
        style={{
          fontSize: "9px"
        }}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </g>
  );
};

export function onDefault (defaultColor, colorList) {
  defaultColor((colors) => {
    return colorList.map((item, i) => {
        item['color'] = colors[i]['color']
        return item
    })
  })
}

export function mappedColorData (colors) {
  return {
    Color1: colors[0].color,
    Color2: colors[1].color,
    Color4: colors[2].color,
    Color5: colors[3].color,
    Color6: "#FFFFFF",
    Category1: colors[0].text,
    Category2: colors[1].text,
    Category4: colors[2].text,
    Category5: colors[3].text,
    Category6: 'Review'
  }
}

export function onSelectColor  (items, selectedRowKeys,setMRNAndCopiedMode, index, color, all = false, modal= false)  {

  let keys = []
  if (all && !modal) {

    let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
    let patientMRN = item['Patient MRN']
    keys = (items.filter(item => item.Status == 'Review'  && item['Patient MRN'] == patientMRN)).map(item => item.ID)
    setMRNAndCopiedMode()

  } else if (all && modal) {

    let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
    let patientMRN = item['Patient MRN']
    keys = (items.filter(item => item.Status == 'Review' && item['Patient MRN'] == patientMRN)).map(item => item.ID)
    setMRNAndCopiedMode()

  } else {
    keys = selectedRowKeys
  }


  return {
    color,
    keys,
    all,
    index
  }


}

export function get(obj, key) {
  return key.split(".").reduce(function (o, x) {
    return o === undefined || o === null ? o : o[x];
  }, obj);

  // key.split('.').reduce(function(o, x) {
  //     return (o === undefined || o === null) ? o : o[x];
  //   }, obj);
}


Object.byString = function (o, s) {
  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  let a = s.split(".");
  for (let i = 0, n = a.length; i < n; ++i) {
    let k = a[i];
    if (o !== null) {
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    } else {
      return;
    }
  }
  return o;
};

/* 
 To check only if a property exists, without getting its value. It similer get function.
*/
export function has(obj, key) {
  return key.split(".").every(function (x) {
    if (typeof obj !== "object" || obj === null || x in obj === false)
      /// !x in obj or  x in obj === true *** if you find any bug
      return false;
    obj = obj[x];
    return true;
  });
}



export function getDate() {
  var date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    var hours = (new Date(date).getHours())
    var minutes = (new Date(date).getMinutes())
    var seconds = (new Date(date).getSeconds())
    var offset = (new Date(date).getTimezoneOffset())

    var year = (new Date(date).getFullYear())
    var month = (new Date(date).getMonth())
    var currentDate = (new Date(date).getDate())

    var fullDate = year

    
    if (month < 9) {
      month = ('0' + (month + 1))
      fullDate += "-" + month

    } else {
      month = (month + 1)
      fullDate += "-" + month
    }


    if (hours < 10) {
      hours = ('0' + hours.toString() )
    } else {
      hours = (hours)
    }

    if (minutes < 10) {
      minutes = ('0' + minutes)
    } else {
      minutes = (minutes )
    }

    if (seconds < 10) {
      seconds = ('0' + seconds)
    } else {
      seconds = (seconds )
    }


    if (currentDate < 10) {
      currentDate = ('-0' + currentDate)
      fullDate += currentDate
    } else {
      currentDate = ('-' + currentDate)
      fullDate += currentDate
    }


    return (fullDate+ "T"+ hours + ":" + minutes + ":" + seconds  + "." + offset + "Z" )

}


export function getDay() {
  const days = ['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat']
  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours());        
  return days [new Date().getDay()]
}






/* 
 convert indexes to properties
*/
export function valueByString(obj, string, devider) {
  if (devider === undefined) {
    devider = "|";
  }
  return string
    .split(devider)
    .map(function (key) {
      return get(obj, key);
    })
    .join(" ");
}

/*
 Submit multi-part form using ajax.
*/
export function toFormData(form) {
  let formData = new FormData();
  const elements = form.querySelectorAll("input, select, textarea");
  for (let i = 0; i < elements.length; ++i) {
    const element = elements[i];
    const name = element.name;

    if (name && element.dataset.disabled !== "true") {
      if (element.type === "file") {
        const file = element.files[0];
        formData.append(name, file);
      } else {
        const value = element.value;
        if (value && value.trim()) {
          formData.append(name, value);
        }
      }
    }
  }

  return formData;
}

/*
 Format Date to display admin
*/

export function formatDate(param) {

  if(param) {
    if(param.toString().includes('/') > 0) {

      return param
    } else {
      let [year, month, date] = param.toString().split('T')[0].split('-') 

    date = month + "/" +date + "/" +year
    return date
    }
       
  }
  return '';
}


/*
 Format Datetime to display admin
*/
export function formatDatetime(param) {
  let time = new Date(param).toLocaleTimeString();
  return formatDate(param) + " " + time;
}


/*
 Set object value in html
*/
export function bindValue(obj, parentElement) {
  parentElement.querySelectorAll("[data-property]").forEach((element) => {
    const type = element.dataset.type;
    let value = valueByString(obj, element.dataset.property);
    switch (type) {
      case "date":
        value = formatDate(value);
        break;

      case "datetime":
        value = formatDatetime(value);
        break;

      case "currency":
        value = value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        break;

      default:
        break;
    }
    element.innerHTML = value;
  });
}

export default getPageQuery;
