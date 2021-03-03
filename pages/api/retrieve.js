/*
  function retrieveData() {
    fetch('https://cors-anywhere.herokuapp.com/https://www.jetblackespresso.com.au/do/WS/NetoAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
        "NETOAPI_ACTION": "GetItem",
        "NETOAPI_KEY": apiKey
      },
      body: JSON.stringify({"Filter": {
      "IsActive":"True",
      "OutputSelector":[
      "SKU",
      "Name",
      "SupplierItemCode",
      "ItemURL"
      ] 
    }}),
    })
    .then(response => response.json())
    .then(data => {
      setUnkeyedData(data.Item)
    })
    .catch((error) => {
      console.log(error)
    });
  }
*/
import Cors from 'cors'
import initMiddleware from '../../lib/init-middleware'

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export default async function retrieve(req, res) {
  await cors(req, res)

  fetch('https://www.jetblackespresso.com.au/do/WS/NetoAPI', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Accept": "application/json",
      "NETOAPI_ACTION": "GetItem",
      "NETOAPI_KEY": req.body.apiKey
    },
    body: JSON.stringify({"Filter": {
    "IsActive":"True",
    "OutputSelector":[
    "SKU",
    "Name",
    "SupplierItemCode",
    "ItemURL"
    ] 
  }}),
  })
  .then(response => response.json())
  .then(data => {
    res.status(200).json(data.Item)
  })
  .catch((error) => {
    console.log(error)
  });
}
  