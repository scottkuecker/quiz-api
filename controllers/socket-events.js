/**
 * @description Save current socket into db for specific later notification
 * @returns EVENT STRING
 */
exports.SAVE_SOCKET = () => 'SAVE_SOCKET';


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


/**
* @description Emit to client room results
* @common_data_to_send {users: room users array, event: 'GET_ROOM_RESULTS'}
* @returns EVENT STRING
*/
 exports.GET_ROOM_RESULTS = () => 'GET_ROOM_RESULTS';


/**
* @description cleaning the rooms
* @common_data_to_send {'CLEAN_THE_EMPTY_ROOMS'}
* @returns EVENT STRING
*/
exports.CLEAN_THE_EMPTY_ROOMS = () => 'CLEAN_THE_EMPTY_ROOMS';


/**
* @description Receives an id of a user to send friend request to
* @common_data_to_send {event: 'ADD_FRIEND', success: boolean}
* @returns EVENT STRING
*/
exports.ADD_FRIEND = () => 'ADD_FRIEND';


/**
* @description Inform the user that request has been sent allready
* @common_data_to_send {event: 'FRIEND_ALLREADY_REQUESTED'}
* @returns EVENT STRING
*/
exports.FRIEND_ALLREADY_REQUESTED = () => 'FRIEND_ALLREADY_REQUESTED';


/**
* @description Emit to client about failed friend acceptance
* @common_data_to_send {event: 'ADD_FRIEND_FAILED'}
* @returns EVENT STRING
*/
exports.ADD_FRIEND_FAILED = () => 'ADD_FRIEND_FAILED';

/**
* @description Accepts friend request
* @common_data_to_send {event: 'ACCEPT_FRIEND', success: boolean}
* @returns EVENT STRING
*/
exports.ACCEPT_FRIEND = () => 'ACCEPT_FRIEND';


/**
* @description Mark the user offline on user logout
* @common_data_to_send {event: 'USER_DISCONECTED', user_id: string}
* @returns EVENT STRING
*/
exports.DISCONNECT_USER = () => 'DISCONNECT_USER';

/**
* @description Mark the user online
* @common_data_to_send {event: 'USER_CONNECTED', user_id: string}
* @returns EVENT STRING
*/
exports.USER_CONNECTED = () => 'USER_CONNECTED';


/**
* @description Mark the user offline
* @common_data_to_send {event: 'USER_DISCONECTED', user_id: string}
* @returns EVENT STRING
*/
exports.USER_DISCONECTED = () => 'USER_DISCONECTED';

/**
* @description Emit this event to roomName
* @common_data_to_send {event: 'TOURNAMENT_INVITATION', roomName: string}
* @returns EVENT STRING
*/
exports.INVITE_FRIENDS = () => 'INVITE_FRIENDS';


/**
* @description Emit this event to roomName
* @common_data_to_send {event: 'TOURNAMENT_INVITATION', roomName: string}
* @returns EVENT STRING
*/
exports.TOURNAMENT_INVITATION = () => 'TOURNAMENT_INVITATION';



