import React, { useEffect, useMemo, useRef } from "react"
import { io } from "socket.io-client";
// import { URL } from "./chat";
export const Voice_ = () => {
    const socket = useMemo(() => io("https://backend-virid-gamma-gtvuhe17sx.vercel.app/",{
 path: "/socket.io/",
      transports: ["polling"],
      withCredentials: true
 
}), []);
    console.log(socket)

    useEffect(() => {
        socket.on('connect', () => {
            console.log('socket ID ', socket.id)
        })
        return () => {
            socket.disconnect()
        }
    }, [])


    let stream = null
    let audioRef = useRef()
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
    });
    const openCamera = async () => {

        stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        stream.getTracks().forEach(track => {
            console.log(track)
            peerConnection.addTrack(track, stream);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log(offer)

        socket.emit('offer', offer)
        if (audioRef.current) {
            audioRef.current.srcObject = stream;
            console.log('current ')
        }

        socket.on('offer', async (offer) => {
            console.log('received', offer)
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer)
            );
            const answer = await peerConnection.createAnswer();

            // 3. save your own answer
            await peerConnection.setLocalDescription(answer);

            // 4. send answer back
            socket.emit("answer", { answer });
        })
        socket.on("answer", async ({ answer }) => {
            // console.log('asnswe', answer)
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        });
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    candidate: event.candidate
                });
            }
        };
        socket.on("ice-candidate", async ({ candidate }) => {
            try {
                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );
                console.log("ICE added");
            } catch (err) {
                console.error("ICE error:", err);
            }
        });
    }

    const CloseCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            console.log('Closed camera')
        }
        if (audioRef.current) {
            audioRef.current.srcObject = null;
            console.log('current ')
        }
        socket.emit("end-call", '2');
        socket.on("call-ended", () => {
            peerConnection.close();
            console.log("Call ended");
        });
    }
    return (<>
        <div className="p-3 flex  justify-center gap-4 mt-4 ">
            <button
                type="button"
                onClick={openCamera}
                className="text-white bg-amber-500 px-4 py-2 rounded-xl cursor-pointer hover:bg-amber-600 active:scale-95 transition-all duration-200 shadow-md"
            >
                Open
            </button>
            <button
                type="button"
                onClick={CloseCamera}
                className="text-white bg-amber-500 px-4 py-2 rounded-xl cursor-pointer hover:bg-amber-600 active:scale-95 transition-all duration-200 shadow-md"
            >
                Close
            </button>
            <audio ref={audioRef} autoPlay></audio>
        </div>

    </>)
}
