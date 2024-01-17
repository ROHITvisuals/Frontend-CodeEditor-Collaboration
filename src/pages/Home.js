import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const Home = () => {
    const [roomId, setRoomId] = useState("")
    const [username, setUsername] = useState("")
    const history =  useNavigate()

    const createNewRoom = (e) => {
        e.preventDefault()
        const id = uuidv4();
        setRoomId(id)
        console.log(id);
        toast.success("created a new room")
    }
    
    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error("RoomId and UserName is required")
            return
        }
        // redirect
        history(`/editor/${roomId}` , {
            state: {
                username ,
            }
        })

    }
    return (
        <div className='homePageWrapper' >
            <div className="formWrapper">
                <img src="" alt="" />
                <h4>Paste Invitation Room ID</h4>
                <div className="inputGroup">
                    <input onChange={(e) => setRoomId(e.target.value)} type="text" value={roomId} name="" id="" placeholder=' Room ID' />
                    <input onChange={(e) => setUsername(e.target.value)} type="text" name="" id="" placeholder=' User Name' />
                </div>
                <button onClick={joinRoom} >Join</button>
                <div>
                    <span>if you dont have any invite then:  &nbsp;  <Link onClick={createNewRoom} to="" >new room</Link> </span>
                </div>
            </div>
        </div>
    )
}

export default Home
