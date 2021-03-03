/*
  const commitPageData = (newHtml) => {
    fetch('https://cors-anywhere.herokuapp.com/https://www.jetblackespresso.com.au/do/WS/NetoAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
        "NETOAPI_ACTION": "UpdateContent",
        "NETOAPI_KEY": apiKey
      },
      body: JSON.stringify({
        "Content": [{
          "ContentID": contentID,
          "Description1": newHtml
        }]
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
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

export default async function commit(req, res) {
  await cors(req, res)

  const {contentID, newHtml, apiKey} = req.body;

  fetch('https://www.jetblackespresso.com.au/do/WS/NetoAPI', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Accept": "application/json",
      "NETOAPI_ACTION": "UpdateContent",
      "NETOAPI_KEY": apiKey
    },
    body: JSON.stringify({
      "Content": [{
        "ContentID": contentID,
        "Description1": newHtml
      }]
    }),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data)
    res.status(200).json({ outcome: 'Success' })
  })
  .catch((error) => {
    console.log(error)
    res.status(500).json({ error: 'There was an error' })
  });
}
  
}
  