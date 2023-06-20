// Generate random room name if needed

const configuration = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};

function onSuccess() {};
function onError(error) {
    console.error(error);
}

class Rtc {
    constructor({ url, config }) {
        this.url = url;
        this.config = config;
    }

    pcInit() {
        const pc = this.pc = new RTCPeerConnection(this.config || configuration);
        pc.onicecandidate = event => {
            if (event.candidate) {
                this.io.emit('candidate', event.candidate)
            }
        };

        pc.onnegotiationneeded = () => {
            pc.createOffer().then((offer) =>{
                pc.setLocalDescription(offer);
                this.io.emit('offer', offer);
            }).catch(onError);
        }

        pc.ontrack = event => {
            const stream = event.streams[0];
            const remoteVideo = document.getElementById('remote');
            remoteVideo.srcObject = stream;
        };
    }

    ioInit() {
        const { pc, io } = this;
        io.on('message', (message) => {
            // Message was sent by us

            if (message.type === 'offer' || message.type === 'answer') {
                // This is called after receiving an offer or answer from another peer
                pc.setRemoteDescription(new RTCSessionDescription(message), () => {
                    if (pc.remoteDescription.type === 'offer') {
                        pc.createAnswer().then((answer) => {
                            pc.setLocalDescription(answer);
                            io.emit('answer', answer);
                        }).catch(onError);
                    }
                }, onError);
            } else if (message.candidate) {
                // Add the new ICE candidate to our connections remote description
                pc.addIceCandidate(
                    new RTCIceCandidate(message), onSuccess, onError
                );
            }
        });
    }

    join(roomId) {
        this.io = io(this.url);
        this.io.emit('join', { roomId });
    }

    start() {
        this.pcInit();
        this.ioInit();
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        }).then(stream => {
            this.localStream = stream;
            const selfVideo = document.getElementById('self');
            selfVideo.srcObject = stream;
            stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
        }, onError);
    }

    destroy() {
        this.pc.close();
        this.io.disconnect();
    }
}

const rtc = new Rtc({
    url: 'wss://192.168.0.100:4000'
})

function join() {
    rtc.join(1111);
}

function connect() {
    rtc.start();
}
