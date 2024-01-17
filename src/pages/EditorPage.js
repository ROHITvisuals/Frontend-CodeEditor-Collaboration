import React, { useEffect, useRef, useState } from 'react'
import Client from '../Components/Client'
import Editor from '../Components/Editor'
// import { initSocket } from '../Socket'
import { io } from "socket.io-client"
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'


const EditorPage = () => {
  const socketRef = useRef(null)    // useRef because : koi data jo multiple render pe awailable ho  aur uske change hone ke baad component hamara rerender na ho :: iske liye use karte h
  // usestate ke sath dikkat h he ki state ke change p component rerender ho jata h // but useRef ke change p component hamara rerender nhi hoga

  const codeRef = useRef(null);

  const location = useLocation()
  const { roomId } = useParams()
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([])

  useEffect(() => {
    socketRef.current = io("http://localhost:4000");
    socketRef.current.on('connect_error', (err) => handleErrors(err));
    socketRef.current.on('connect_failed', (err) => handleErrors(err));

    function handleErrors(e) {
      console.log('socket error', e);
      toast.error('Socket connection failed, try again later.');
      reactNavigator('/');
    }

    socketRef.current.emit("join", {
      roomId,
      username: location.state?.username
    });

    // listeming to joined event
    socketRef.current.on("joined", ({ clients, username, socketId }) => {
      if (username !== location.state.username) {
        toast.success(`${username} joined the room...`)
        console.log(`${username} joined`);
      }
      setClients(clients)
      socketRef.current.emit( "sync-code" , {
        code: codeRef.current,
        socketId,
      });
    })

    // Listening for "disconnected" ::
    socketRef.current.on("disconnected", ({ socketId, username }) => {
      toast.success(`${username} left the room`);
      setClients((prev) => {  // in react - aap stateUpdate function ke andar value bhi de sakte h aur callback function bhi de sakte h :: NOTE - prev m hamko state ki previous value mil jati h
        return prev.filter(
          (client) => client.socketId !== socketId
        );
      })
    })

    // on basically listener h // jo listner h usko clear karna bholna nhi kabhi bhi - nhi to memory leak ki problem ho sakti h
    // aur clear karne ka kaam hum normaly hum cleaning function ke andar karte h.
    // useEffect ke andar jab koi function return karte h , to vo hamara cleaning function hota h :://:: jesehi component UnMount ho jayega , then cleaning function call ho jayegi (function that we have return in useEffect)
    // aur is cleaning function ke andar hum listener (on) ko clear karne ka kaam kar sakte h.
    return () => {   // hum is cleaning function ke andar socket ko disconnect kar rahe h , kyuki hum is page se ja rahe h to hame ab socket connection ki jarurat nhi h .
      socketRef.current.off("joined"); // event ko unsubscribe kar diya 
      socketRef.current.off("disconnected"); // event ko unsubscribe kar diya 
      // call disconnect at the end
      socketRef.current.disconnect(); // socket ko disconnect kar diya  
    };

  }, []) // useEffect p empty array [] dena h , agar nhi doge [] har render p / in every render - useEffect call ho jayega.

  const copyRoomId = async () => {
    try {
      // browser ke andar inbuilt API asti h (navigator) - navigator ke andar bahut sari cheeje aati h (like media hume get karna h , camera , microPhone , etc we get inside navigator )
      // navigator / Browser inbuilt API hame globally available hota is tarah se use karne ke liye kyuki ye hamare window object ke upar hota h.
      await navigator.clipboard.writeText(roomId);  // 
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className='mainWrap' >
      <div className="aside">
        <h3>connected</h3>
        <div className="clientlist">
          {clients.map((client) => (
            <Client key={client.socketId} username={client.username} />
          ))}
        </div>
        <div className="copy_id" onClick={copyRoomId} >copy room id</div>
        <div className="leave" onClick={leaveRoom} >leave</div>
      </div>
      <div className="editorwrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
         onCodeChange={(code) => {
             codeRef.current = code;
         }}
        />
      </div>
    </div>
  )
}

export default EditorPage
