/*
const pullPageData = () => {
    fetch('https://cors-anywhere.herokuapp.com/https://www.jetblackespresso.com.au/do/WS/NetoAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json",
        "NETOAPI_ACTION": "GetContent",
        "NETOAPI_KEY": apiKey
      },
      body: JSON.stringify({
        "Filter": {
          "ContentName": explodedPage,
          "Active":"Boolean",
          "ContentType":"Web Page",
          "OutputSelector":[
          "BodyTemplate",
          "Description1",
          "ContentType",
          "ContentName",
          "ContentID",
          "ID",
          "ParentContentID"
          ] 
        }
      }),
    })
    .then(response => response.json())
    .then(data => {
      setContentID(data.Content[0].ContentID);
      const parsed = domparser.parseFromString(data.Content[0].Description1, 'text/html')
      let baseEl = parsed.createElement('base');
      baseEl.setAttribute('href', 'https://www.jetblackespresso.com.au');
      parsed.head.append(baseEl);
      setPageData(parsed)
      console.log(parsed)
      if (parsed.getElementsByTagName("map").length >= 1) {
        console.log('Already has map')
        const html = Array.prototype.reduce.call(parsed.getElementsByTagName("map"), (html, node) => html + ( node.outerHTML || node.nodeValue ), "");
        setExistingMap(html)
      }
      setImageSrc(parsed.getElementsByTagName("img")[0].src)
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

export default async function pull(req, res) {
  await cors(req, res)

  const {apiKey, explodedPage} = req.body;

  console.log(apiKey);
  console.log(explodedPage);

  await fetch('https://www.jetblackespresso.com.au/do/WS/NetoAPI', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Accept": "application/json",
      "NETOAPI_ACTION": "GetContent",
      "NETOAPI_KEY": apiKey
    },
    body: JSON.stringify({
      "Filter": {
        "ContentName": explodedPage,
        "Active":"Boolean",
        "ContentType":"Web Page",
        "OutputSelector":[
        "BodyTemplate",
        "Description1",
        "ContentType",
        "ContentName",
        "ContentID",
        "ID",
        "ParentContentID"
        ] 
      }
    }),
  })
  .then(response => response.json())
  .then(response => {
    res.status(200).json(response)
  })
  .catch((error) => {
    console.log(error)
  });
}
  