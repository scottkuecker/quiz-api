
const TOURNAMENT = require('./socket-functions/tournament');
const EVENTS = require('./socket-events');
const crypto = require('crypto');

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
        return this.generate();
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
        let counter = 0;
        while (counter < this.queue.length - 1){
            counter++;
            const match = new GenerateMatch(this.queue[0], this.queue[1])
            this.playing.push(match);
            this.queue = this.queue.filter((item, index) => index !== 0 && index !== 1);
        }
        return this;
    }

    checkForMatch(){
        let i = 0;
        while(i <= this.playing.length - 1){
            if(!this.playing[i][0].busy){
                this.playing[i][0].busy = true;
                this.io.in(this.playing[i][1]._id.toString()).emit(EVENTS.MATCH_FOUND(), {event: EVENTS.MATCH_FOUND(), data: {me: this.playing[i][1], oponent: this.playing[i][2]}});
                this.io.in(this.playing[i][2]._id.toString()).emit(EVENTS.MATCH_FOUND(), {event: EVENTS.MATCH_FOUND(), data: {me: this.playing[i][2], oponent: this.playing[i][1]}});
            }
            i++;
        }
    }

    acceptOpponent(oponentID, myID, roomName){
        this.io.in(oponentID.toString()).emit(EVENTS.OPONENT_ACCEPTED(), { event: EVENTS.OPONENT_ACCEPTED(), data: true });
    }

    declineOpponent(oponentID, myID, roomName) {
        this.io.in(oponentID.toString()).emit(EVENTS.OPONENT_DECLINED(), { event: EVENTS.OPONENT_DECLINED(), data: true });
        this.playing = this.playing.filter(item => item[0].roomName !== roomName);
    }

    matchFinished(roomName){
        this.playing = this.playing.filter(match => match[0].roomName !== roomName);
        this.io.emit(EVENTS.TRACK_QUEUE_MANAGER(), { event: EVENTS.TRACK_QUEUE_MANAGER(), data: { queue: this.queue, playing: this.playing } });
    }
}


