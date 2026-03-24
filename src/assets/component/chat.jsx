import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

 const URL = "http://localhost:5000";
export const Chat_ = () => {
    const [val, setVal] = useState({ msg: '', room: '' });
    const [receive, setReceive] = useState({});
    const [roomID, setroomID] = useState("")
    const [Room, setroom] = useState('');

    const socket = useMemo(() => io(URL), []);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("connected", socket.id);
            setroomID(socket.id)

        });

        socket.on("receiveMsg", (receiveMsg) => {
            console.log("received:", receiveMsg);
            // setReceive(receiveMsg);
        });

        return () => {
            socket.off("connect");
            socket.off("receiveMsg");
            socket.disconnect('disconnect', (socket) => {
                // console.log("disconnect", socket.id);

            });
        };
    }, [socket]);

    const handleChange = (e) => {
        const { name, value } = e.target
        // console.log(name, value)
        setVal((prev) => ({
            ...prev,
            [name]: value,
        }));

      
    };
    // console.log(val)

    const handleSend = (e) => {
        e.preventDefault();
        socket.emit("sendMsg", { msg: val, time: new Date() });
    };


    return (
        <div className="p-3 flex  flex-col gap-5 justify-start">
            {
                roomID
            }
            <div className="bg-white shadow flex w-fit gap-5 justify-center rounded-xl p-2">
                <input
                    type="text"
                    name="msg"
                    className="p-2 border border-slate-500 rounded-md focus:border-amber-500 focus:outline-none"
                    onChange={handleChange}

                    placeholder="Enter anything"
                />
                <button
                    type="button"
                    onClick={handleSend}
                    className="text-white bg-amber-500 px-4 py-2 rounded-xl cursor-pointer hover:bg-amber-600 active:scale-95 transition-all duration-200 shadow-md"
                >
                    Send
                </button>
            </div>
            <div className="bg-white shadow flex w-fit gap-5 justify-center rounded-xl p-2">
                <input
                    type="text"
                    name="room"
                    className="p-2 border border-slate-500 rounded-md focus:border-amber-500 focus:outline-none"
                    onChange={handleChange}

                    placeholder="Enter Room ID"
                />

            </div>


        </div>
    );
};