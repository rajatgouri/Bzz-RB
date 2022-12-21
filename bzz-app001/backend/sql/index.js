var request = require('request');
let endpoints = {}

endpoints.query = async (query) => {
  try {

     return new Promise(async(resolve, reject) => {

      let options = {
        method: 'POST',
        url: process.env.DB_URL +  "/login",
        headers: {
          "Content-Type": 'application/json',

        },
        body:{
          "email" : process.env.DB_URL_EMAIL  ,
          "password": process.env.DB_URL_PASSWORD
        },
        json: true,
        timeout: 999999999
      }
    
      request(options,  (error, response, body)=>{
     
        // Printing the error if occurred

        if(error) {
          resolve({status: false, result: [], error: error})
          return

      }
      
        if(!response) {
          resolve({status: false, result: [], error: error})
          return
        }

        if(response.statusCode != 200) {
          resolve({status: false, result: [], error: error})
          return

        }

        let options_query = {
          method: 'POST',
          url: process.env.DB_URL + "/database/query",
          headers: {
            "Content-Type": 'application/json',
            'x-auth-token': body.result.token
  
          },
          body:{
            'query': query
          },
          json: true,
          
        }
      
        request(options_query,  (error, response, body)=>{
      
         
          // Printing the error if occurred
          if(error) {
              resolve({status: false, result: [], error: error})
              return
          }

          if(!response) {
            resolve({status: false, result: [], error: error})
            return
          }
          
          if(response.statusCode != 200) {
            resolve({status: false, result: [], error: error})
          }
  
        
          resolve({status: true, recordset: body.result? body.result : [] })

  
          
      }); 


    }); 
    
     })



  } catch (err) {
      console.log(err)
     throw err
  }
}


endpoints.cloud = async (query,folder, file) => {
  try {

     return new Promise(async(resolve, reject) => {

      let options = {
        method: 'POST',
        url: process.env.DB_URL +  "/login",
        headers: {
          "Content-Type": 'application/json',

        },
        body:{
          "email" : process.env.DB_URL_EMAIL  ,
          "password": process.env.DB_URL_PASSWORD
        },
        json: true
      }
    
      request(options,  (error, response, body)=>{
     
        // Printing the error if occurred
        if(error) {
          resolve({status: false, result: [], error: error})
          return

      }
      
        if(!response) {
          resolve({status: false, result: [], error: error})
          return
        }

        if(response.statusCode != 200) {
          resolve({status: false, result: [], error: error})
          return

        }

        let options_query = {
          method: 'POST',
          url: process.env.DB_URL + `/${query}/query`,
          headers: {
            "Content-Type": 'application/json',
            'x-auth-token': body.result.token
  
          },
          body:{
            'folder': folder,
            'file': file
          },
          json: true
        }
      
        request(options_query,  (error, response, body)=>{
       
        
          // Printing the error if occurred
          if(error) {
              resolve({status: false, result: [], error: error})
              return
          }

          if(!response) {
            resolve({status: false, result: [], error: error})
            return
          }
          
          if(response.statusCode != 200) {
            resolve({status: false, result: [], error: error})
          }
  
  
          resolve({status: true, recordset: body.result})
          
      }); 


    }); 
    
     })



  } catch (err) {
      console.log(err)
     throw err
  }
}

module.exports = endpoints;
