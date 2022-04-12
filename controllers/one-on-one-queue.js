
const TOURNAMENT = require('./socket-functions/tournament');
const EVENTS = require('./socket-events');

exports.QueueManager = class {
    static instance = null;

    constructor() {
        throw new Error('Use QueueManager.getInstance()');
    }

    static getInstance() {
        if (!PrivateQueueManager.instance) {
            PrivateQueueManager.instance = new PrivateQueueManager();
        }
        return PrivateQueueManager.instance;
    }
}






class GenerateMatch{
    roomIDLength = 5;

    constructor(user1, user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.generate();
    }

    randomValue = () => {
        return crypto.randomBytes(Math.ceil(this.roomIDLength / 2))
            .toString('hex')
            .slice(0, this.roomIDLength).toUpperCase();
    }

    generate() {
        return [
            { roomName: this.randomValue(), busy: false },
            this.user1,
            this.user2
        ]
    }
}




class PrivateQueueManager{
    queue = [];
    playing = [];
    io;

    constructor(){
        this.io = TOURNAMENT.getIO();
    }
    

    addToQueue(user){
        this.queue.push(user);
        this.generateMatches();
        this.checkForMatch();
        this.io.emit(EVENTS.TRACK_QUEUE_MANAGER(), { event: EVENTS.TRACK_QUEUE_MANAGER(), data: { queue: this.queue, playing: this.playing }  });
        return this;
    }

    generateMatches(){
        while(this.queue.length >= 2){
            const match = new GenerateMatch(this.queue[0], this.queue[1])
            this.playing.push(match);
            this.queue = this.queue.filter((item, index) => index !== 0 || index !== 1);
        }
        return this;
    }

    checkForMatch(){
        let i = 0;
        while(i <= this.playing.length - 1){
            //this.playing[i][0] -> {roomName: string, busy: boolean};
            //this.playing[i][1] -> user1
            //this.playing[i][2] -> user2
            if(!this.playing[i][0].busy){
                this.playing[i][0].busy = true;
                this.io.emit(this.playing[i][0].roomName, {event: EVENTS.MATCH_FOUND(), data: [this.playing[i][1], this.playing[i][2]]});
            }

        }
    }

    matchFinished(roomName){
        this.playing = this.playing.filter(match => match[0].roomName !== roomName);
        this.io.emit(EVENTS.TRACK_QUEUE_MANAGER(), { event: EVENTS.TRACK_QUEUE_MANAGER(), data: { queue: this.queue, playing: this.playing } });
    }
}


