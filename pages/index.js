import React, {useState} from 'react';
import Head from 'next/head'
import '../styles/Home.module.css';
import {fetchUrl} from '../lib/utilities.js';
import ReactModal from 'react-modal';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

ReactModal.setAppElement('#root')

export default function Home() {

  

  const [exceptions, setExceptions] = useState([])
  const [multiples, setMultiples] = useState([])
  const [unkeyedData, setUnkeyedData] = useState()
  const [pageData, setPageData] = useState()
  const [contentID, setContentID] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [explodedPage, setExplodedPage] = useState('')
  const [imageSrc, setImageSrc] = useState()
  const [existingMap, setExistingMap] = useState('No existing map data has been loaded/exists for this page')
  const [newHtml, setNewHtml] = useState()
  const [modalIsOpen,setIsOpen] = useState(true);
  const [unsafeOperation, setUnsafeOperation] = useState(true);
  const [copied,setCopied] = useState(false);
  function openModal() {
    setIsOpen(true);
  }

  function resetPageData() {
    setExceptions([])
    setMultiples([])
    setPageData()
    setContentID('')
    setExplodedPage('')
    setImageSrc()
    setExistingMap('')
    setNewHtml()
    setCopied(false)
  }

  function closeModal(){
    setIsOpen(false);
    if (apiKey.length >= 32 && !unkeyedData) {
      retrieveData()
    } else if (unkeyedData) {
      console.log('Already retrieved Data')
    } else {
      console.log('Not a valid API key. Could not retrieve data.')
    }
  }

  function retrieveData() {
    fetch('/api/retrieve', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: apiKey,
      })
    })
    .then(response => response.json())
    .then(data => {
      setUnkeyedData(data)
    })
    .catch((error) => {
      console.log(error)
    });
  }

  const pullPageData = () => {
    let domparser = new DOMParser()
    fetch('/api/pull', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: apiKey,
        explodedPage: explodedPage
      })
    })
    .then(response => response.json())
    .then(data => {
      setContentID(data.Content[0].ContentID);
      const parsed = domparser.parseFromString(data.Content[0].Description1, 'text/html')
      let baseEl = parsed.createElement('base');
      baseEl.setAttribute('href', 'https://www.jetblackespresso.com.au');
      parsed.head.append(baseEl);
      setPageData(parsed)
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


  const commitPageData = (htmlToSend) => {
    fetch('/api/commit', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newHtml: htmlToSend,
        apiKey: apiKey,
        contentID: contentID
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
    })
    .catch((error) => {
      console.log(error)
    });
  }

  const appendCode = () => {
    const returnHtml = pageData;

    const bodyTag = returnHtml.getElementsByTagName("body")[0]

    const imgTag = returnHtml.getElementsByTagName("img")[0]
    imgTag.setAttribute('usemap', '#map')

    const mapTag = returnHtml.createElement('map');
    mapTag.setAttribute('name', 'map');

    newHtml.forEach(item => {
      mapTag.append(item.cloneNode(true))
    })
    bodyTag.append(mapTag)
    const html = Array.prototype.reduce.call(bodyTag.childNodes, (html, node) => html + ( node.outerHTML || node.nodeValue ), "");

    commitPageData(html)
  }

  const handleApiKey = event => {
    setApiKey(event.target.value);
  }

  const handleExplodedPage = event => {
    setExplodedPage(event.target.value);
  }

  const copyClipboard = source => {
    navigator.clipboard.writeText(source).then(() => {
      setCopied(true)
      console.log("clipboard copy succeeded")
    }, ()=>{
      alert('Copying failed, please try again')
      console.log("clipboard copy failed")
    })
  }


  function translateHtml() {
    let domparser = new DOMParser()
    setExceptions([]);
    setMultiples([]);
    const outputArea = document.getElementById('htmloutput');
    const option = document.querySelector('input[name="string-options"]:checked').value
    const rawString = document.getElementById('htmlinput').value.replace(/\s\s/g,'').replace(/(>\s)|(>\n)/g,'>') //strips out spaces and newlines
    if (rawString === '') return; //if input is empty, exit the function

    const data = domparser.parseFromString(rawString, 'text/html')
    const mapEl = data.getElementsByTagName("map")[0].childNodes

    mapEl.forEach(node => {
      if (node.alt !== "") {
        console.log("Skipped " + node.pathname.substring(1))
        return;
      };
      const [href, type] = fetchUrl(node.title || node.pathname.substring(1), option, unkeyedData, setExceptions, setMultiples)
      console.log(node.title || node.pathname.substring(1) + " " + type);
      node.alt = type === 'search' ? '' : node.title || node.pathname.substring(1)
      node.title = node.title === '' ? node.pathname.substring(1) : node.title
      if (type === 'search') {
        node.dataset.maphilight = `{"strokeColor":"ff0000"}`
      }
      node.href = href
    })

    setNewHtml(mapEl)

    const html = Array.prototype.reduce.call(data.getElementsByTagName("map"), (html, node) => html + ( node.outerHTML || node.nodeValue ), "");
    
    outputArea.value = html;
  }

  return (
    <div className="grid" id="root">
    <h1 style={{gridColumn: "1/3", textAlign: "center"}}>Image Map URL builder</h1>
      <div className="buttonBox">
        <button className="updateButton credentialButton" onClick={openModal}>Add Credentials</button>
        <p>Product data loaded: {unkeyedData ? 'true' : 'false'}</p>
      </div>
      <div className="segment grid" style={{width: 'calc(100% - 40px)'}}>
        <h2 style={{gridColumn: "1/3"}}>Image map input:</h2>
        <div>
          {pageData && <button className="updateButton credentialButton" style={{marginLeft: 0, display: 'block', width: "100%", fontSize: "16px", marginTop: '10px', marginBottom: '10px'}} onClick={resetPageData}>Reset</button>}
          <label>Step 1: Paste in page title here:<input disabled={pageData ? true : false} style={{ display: 'block', width: "100%", fontSize: "16px", marginTop: '10px', marginBottom: '10px'}} type="text" value={explodedPage} onChange={handleExplodedPage} /></label>
          <label>Step 2: Click to retrieve page details:<button disabled={explodedPage ? false : true} className="updateButton credentialButton" style={{marginLeft: 0, display: 'block', width: "100%", fontSize: "16px", marginTop: '10px', marginBottom: '10px'}} onClick={pullPageData}>Get details</button></label>

        <label>Step 3: <button disabled={imageSrc ? false : true} className="updateButton credentialButton" style={{marginLeft: 0, display: 'block', width: "100%", fontSize: "16px", marginTop: '10px', marginBottom: '10px'}} onClick={() => copyClipboard(imageSrc)}>Copy image URL</button></label>
        <label>Step 4: <button disabled={copied ? false : true} className="updateButton credentialButton" style={{marginLeft: 0, display: 'block', width: "100%", fontSize: "16px", marginTop: '10px', marginBottom: '10px'}} onClick={() => window.open('https://summerstyle.github.io/summer/', "_blank")}>Open Map Creator</button></label>
        <label>(Optional Step 4a - if updating a map): <button disabled={copied ? false : true} className="updateButton credentialButton" style={{marginLeft: 0, display: 'block', width: "100%", fontSize: "16px", marginTop: '10px', marginBottom: '10px'}} onClick={() => copyClipboard(existingMap)}>Copy existing map data</button></label>
        </div>
        <div style={{overflow: "hidden"}}>
          <p style={{marginTop: '0'}}>Image preview:</p>
          <img style={{width: 'calc(100% - 2px)', border: '1px solid black'}} alt="preview" src={imageSrc ||'/preview.png'} />
        </div>
      </div>
      <div className="segment">
        <h2>Existing Map code</h2>
        <div style={{overflow: 'auto', maxHeight: '300px'}}>
          {existingMap}
        </div>
      </div>
      <div className="segment">
        <h2>Step 5: Paste HTML here</h2>
          <textarea className="textarea" id="htmlinput" name="htmlinput" rows="30" placeholder="Paste the output HTML here" />
          <p>Please select your preferred lookup method and hit 'Update URLS':</p>
          <div>
            <input type="radio" id="stringChoice1"
            name="string-options" value="sku" defaultChecked />
            <label htmlFor="stringChoice1">SKU</label>

            <input type="radio" id="stringChoice2"
            name="string-options" value="partno" />
            <label htmlFor="stringChoice2">Part Number</label>
            <button className="updateButton" onClick={translateHtml} disabled={unkeyedData ? false : true}>Update URLS</button>
          </div>

      </div>
      <div className="segment">
        <h2>Step 6: Copy code from here</h2>
          <textarea className="textarea" id="htmloutput" name="htmloutput" rows="30" />
          <button className="updateButton" onClick={appendCode} disabled={unsafeOperation ? false : true}>Append code back to page</button>
      </div>
      <div className="segment">
        <h2>Exceptions</h2>
        <p>These items did not find a corresponding listing in the database, and will need reviewing manually.</p>
        <p><small>If a possible url is offered, it is likely that there is an incorrect part number for this product in Neto and should be fixed</small></p>
        <div>
          {exceptions.map(item => (
            <p key={item[0]}>{item[0]}{item[1] !== null && ' - possible URL: '}{item[1] && <a href={item[1]['Product URL']}>{item[1]['Product URL']}</a>}</p>
          ))}
        </div>
      </div>
      <div className="segment">
        <h2>Multiples</h2>
        <p>These items had duplicate possible listings in the database, and will need reviewing manually</p>
        <div style={{overflowY: 'scroll'}}>
          {multiples.map(item => {
            return <section key={item[0]}>{item[0]}{item[1] !== null && ' - Options found: '}
              <ul>
                {console.log(item[1])}
                  {item[1].map(option => {
                  return(
                    <li><a href={'https://www.jetblackespresso.com.au/' + option['ItemURL']}>/{option['ItemURL']}</a></li>
                  )
                })}
              </ul>
            </section>
          })}
        </div>
      </div>
      <ReactModal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
        >
          <h2 style={{display: "inline-block", marginTop: 0}}>Credentials</h2>
          <button style={{position: "absolute", top: "20px", right: "20px"}} onClick={closeModal}>close</button>
          <div>Paste your Neto API key below:</div>
          <input style={{width: "100%", fontSize: "16px", marginTop: '10px'}} type="text" value={apiKey} onChange={handleApiKey} />
        </ReactModal>
    </div>
  )
}
