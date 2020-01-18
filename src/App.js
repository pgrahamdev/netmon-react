import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import Table from 'react-bootstrap/Table';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container'

const myWsURL = "ws://" + window.location.host + "/ws";

const OnLineButton = (props) => {
  const onlineStyle = (online) => online ? "success" : "danger"

  const onlineText = (online) => online ? "On-Line" : "Off-Line"

  return (
    <Button className="m-2" variant={onlineStyle(props.online)} onMouseDown={e => e.preventDefault()}>
      {onlineText(props.online)}
    </Button>
  )
}

const AppNavBar = (props) => {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand>
        NetMon
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          Last updated: {props.lastUpdate.toLocaleString()}
        </Navbar.Text>
        <OnLineButton online={props.online} />
      </Navbar.Collapse>
    </Navbar>
  )
}

const TestConnButton = (props) => {
  return (
    <ButtonToolbar className="p-2">
      <Button onClick={() => {
        props.sendMessage("Start") }} onMouseDown={e => e.preventDefault() }>
        Test Connection
      </Button>
    </ButtonToolbar>
  );
}

const StartButton = (props) => {
  return (
    <Button onClick={() => {
      props.sendMessage("Start") }}>
      Start
      </Button>
  );
}

const StopButton = (props) => {
  return (
    <Button onClick={() => {
      props.sendMessage("Stop") }}>
      Stop
      </Button>
  );
}

const ReceivedMessage = (props) => {
  return (
  <div>{props.message}</div>
  );
}

const ResultsTable = (props) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Time</th>
          <th>Server</th>
          <th>Download</th>
          <th>Upload</th>
        </tr>
      </thead>
      <tbody>
        {props.results.map((result, i) => {
          return (<tr key={i}>
            <td>{result.timestamp}</td>
            <td>{result.server.sponsor}</td>
            <td>{(result.download/1e6).toFixed(3)} Mb/s</td>
            <td>{(result.upload/1e6).toFixed(3)} Mb/s</td>
          </tr>)})}
      </tbody>
    </Table>
  )
}

function App() {

  const [lastUpdate, setLastUpdate] = useState(new Date())
  //const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [statusMessage, setStatusMessage] = useState("")
  const [connected, setConnected] = useState(false)
  const socket = useRef();

  useEffect(() => {
    if (!socket.current) {
      socket.current = new WebSocket(myWsURL);
      setConnected(true)
      console.log("Created new WebSocket");
      socket.current.onclose = (msg) => {
        //const incomingMessage = `Message from WebSocket: ${msg.data}`;
        console.log("WebSocket closed.  Cleaning up...")
        socket.current = null
        setConnected(false)
      }
    }
    // I needed to have this updated every time to have access to the latest
    // state!  Otherwise, I can't add to the messages state.
    socket.current.onmessage = (msg) => {
      //const incomingMessage = `Message from WebSocket: ${msg.data}`;
      //console.log(msg.data)
      let result = JSON.parse(msg.data)
      if (result.type === "status") {
        setStatusMessage(result.data);
      } 
      else if (result.type === "init") {
        setMessages(JSON.parse(result.data));
      }
      else if (result.type === "result") {
        const tmpMessage = JSON.parse(result.data)
        setLastUpdate(tmpMessage.timestamp)
        setMessages(messages.concat(tmpMessage));
        setStatusMessage("Result Received.")
      }
    }
  });

  useEffect(() => () => socket.current.close(), [socket])

  const sendMessage = (myMessage) => {
    if (socket.current) {
      try {
        socket.current.send(myMessage);
      }
      catch(error) {
        console.log("Problem trying to send message: " + error)
        socket.current.close()
        setConnected(false)
      }
    } else {
      setConnected(false)
    }
  }

  return (
    <div className="App">
      <AppNavBar lastUpdate={lastUpdate} online={connected}></AppNavBar>
      <Container>
        <Row>
          <Col>
            <TestConnButton sendMessage={sendMessage}></TestConnButton>
            <ReceivedMessage message={statusMessage}></ReceivedMessage>
          </Col>
          <Col className="p-2">
            <ResultsTable results={messages} />
          </Col>
      </Row>
      </Container>
    </div>
  );
}

export default App;
