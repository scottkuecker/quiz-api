/**
 * @description Emit to client that room dont exist
 * @common_data_to_send {event: 'ROOM_DONT_EXIST'}
 * @returns EVENT STRING
 */
exports.ROOM_DONT_EXIST = () => 'ROOM_DONT_EXIST';


/**
 * @description Emited from client to join the room
 * @returns EVENT STRING
 */
exports.JOIN_ROOM = () => 'JOIN_ROOM';


/**
 * @description Emit to all room clients that new user has joined room
 * @common_data_to_send {users: room users array, event: 'JOINED_ROOM'}
 * @returns EVENT STRING
 */
exports.JOINED_ROOM = () => 'JOINED_ROOM';


/**
 * @description Emited from client to leave the room
 * @returns EVENT STRING
 */
exports.LEAVE_ROOM = () => 'LEAVE_ROOM';


/**
 * @description Emit to all room clients that user has leaved room
 * @common_data_to_send {users: room users array, event: 'LEAVED_ROOM'}
 * @returns EVENT STRING
 */
exports.LEAVED_ROOM = () => 'LEAVED_ROOM';


/**
 * @description Emmited from client to create a new room
 * @returns EVENT STRING
 */
exports.CREATE_ROOM = () => 'CREATE_ROOM';


/**
 * @description Emit to client that room has been created
 * @common_data_to_send {success: boolean, event: 'ROOM_CREATED', roomName: string}
 * @returns EVENT STRING
 */
exports.ROOM_CREATED = () => 'ROOM_CREATED';


/**
 * @description Emited from room Admin to start the tournament
 * @common_data_to_send {success: boolean, event: 'TOURNAMENT_STARTING'}
 * @returns EVENT STRING
 */
exports.START_TOURNAMENT = () => 'START_TOURNAMENT';


/**
 * @description Emit to tournament users to start the tournament
 *  @common_data_to_send {success: boolean}
 * @returns EVENT STRING
 */
exports.TOURNAMENT_STARTING = () => 'TOURNAMENT_STARTING';


/**
 * @description Emited from user regarding selected answer on given question
 * @common_data_to_send {success: boolean, event: 'QUESTION_ANSWERED'}
 * @returns EVENT STRING
 */
exports.QUESTION_ANSWERED = () => 'QUESTION_ANSWERED';


/**
 * @description Emited from user that he is in waiting room
 * @common_data_to_send {success: boolean, users: room users array, event: 'WAITING_OTHERS_TO_ANSWER'}
 * @returns EVENT STRING
 */
exports.WAITING_OTHERS_TO_ANSWER = () => 'WAITING_OTHERS_TO_ANSWER';


/**
 * @description Emited to all users that new question is starting
 * @common_data_to_send {success: boolean, users: room users array, event: 'START_NEXT_TOURNAMENT_QUESTION'}
 * @returns EVENT STRING
 */
exports.START_TOURNAMENT_QUESTION = () => 'START_TOURNAMENT_QUESTION';


/**
 * @description Emited to all users that tournament is finished
 * @common_data_to_send {success: boolean, users: room users array, event: 'TOURNAMENT_FINISHED'}
 * @returns EVENT STRING
 */
exports.TOURNAMENT_FINISHED = () => 'TOURNAMENT_FINISHED';


/**
 * @description Emited from client, contains slected question letter
 * @common_data_to_send {correct: boolean, users: room users array, event: 'SELECTED_QUESTION_LETTER'}
 * @returns EVENT STRING
 */
exports.SELECTED_QUESTION_LETTER = () => 'SELECTED_QUESTION_LETTER';

/**
 * @description Emit to room when someone answers question to update waiting status
 * @common_data_to_send {users: room users array, event: 'UPDATE_WAITING_STATUS'}
 * @returns EVENT STRING
 */
 exports.UPDATE_WAITING_STATUS = () => 'UPDATE_WAITING_STATUS';


 /**
 * @description Emit to room when everyone has answered the question
 * @common_data_to_send {users: room users array, event: 'EVERYONE_ANSWERED'}
 * @returns EVENT STRING
 */
  exports.EVERYONE_ANSWERED = () => 'EVERYONE_ANSWERED';

   /**
 * @description Emit to client room question
 * @common_data_to_send {users: room users array, event: 'EVERYONE_ANSWERED'}
 * @returns EVENT STRING
 */
    exports.GET_ROOM_QUESTION = () => 'GET_ROOM_QUESTION';


