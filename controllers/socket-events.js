



/**
 * @description join 1on1 created room
 * @common_data_to_send {event: 'JOIN_ONE_ON_ONE'}
 * @returns EVENT STRING
 */
exports.JOIN_ONE_ON_ONE = () => 'JOIN_ONE_ON_ONE';

/**
 * @description Emit to client that 1 on 1 is ready
 * @common_data_to_send {event: 'BOTH_ACCEPTEDT'}
 * @returns EVENT STRING
 */
exports.BOTH_ACCEPTED = () => 'BOTH_ACCEPTED';

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


/**
* @description Emit tournament room to 2 users that are in room
* @common_data_to_send {event: 'OPONENT_FOUND', roomName: string, oponent: User}
* @returns EVENT STRING
*/
exports.OPONENT_FOUND = () => 'OPONENT_FOUND';


/**
* @description Leaves 1on1 room
* @common_data_to_send {event: 'LEAVE_ONE_ON_ONE'}
* @returns EVENT STRING
*/
exports.LEAVE_ONE_ON_ONE = () => 'LEAVE_ONE_ON_ONE';

/**
* @description Decline 1on1 oponent
* @common_data_to_send {event: 'OPONENT_DECLINED'}
* @returns EVENT STRING
*/
exports.OPONENT_DECLINED = () => 'OPONENT_DECLINED';


/**
* @description Accept 1on1 oponent
* @common_data_to_send {event: 'OPONENT_ACCEPTED'}
* @returns EVENT STRING
*/
exports.OPONENT_ACCEPTED = () => 'OPONENT_ACCEPTED';

/**
* @description emits number of online users
* @common_data_to_send {event: 'ONLINE_USERS_COUNT', online: number}
* @returns EVENT STRING
*/
exports.ONLINE_USERS_COUNT = () => 'ONLINE_USERS_COUNT';

/**
* @description refresh user
* @common_data_to_send {event: 'REFRESH_USER', data: user}
* @returns EVENT STRING
*/
exports.REFRESH_USER = () => 'REFRESH_USER';

/**
* @description Atempts autologin with token
* @common_data_to_send {event: 'AUTOLOGIN', data: user}
* @returns EVENT STRING
*/
exports.AUTOLOGIN = () => 'AUTOLOGIN';


/**
* @description Emits login requests
* @common_data_to_send {event: 'LOGIN', data: User}
* @returns EVENT STRING
*/
exports.LOGIN = () => 'LOGIN';

/**
* @description Emits register requests
* @common_data_to_send {event: 'REGISTER', data: boolean}
* @returns EVENT STRING
*/
exports.REGISTER = () => 'REGISTER';

/**
* @description Emits failed autologin
* @common_data_to_send {event: 'AUTOLOGINFAILED', data: null}
* @returns EVENT STRING
*/
exports.AUTOLOGINFAILED = () => 'AUTOLOGINFAILED';

/**
* @description Emits users list
* @common_data_to_send {event: 'GET_ALL_USERS', data: User[]}
* @returns EVENT STRING
*/
exports.GET_ALL_USERS = () => 'GET_ALL_USERS';

/**
* @description Emits friend list
* @common_data_to_send {event: 'GET_FRIEND_LIST', data: User[]}
* @returns EVENT STRING
*/
exports.GET_FRIEND_LIST = () => 'GET_FRIEND_LIST';


/**
* @description Emits friend requests
* @common_data_to_send {event: 'GET_FRIEND_REQUESTS', data: User[]}
* @returns EVENT STRING
*/
exports.GET_FRIEND_REQUESTS = () => 'GET_FRIEND_REQUESTS';
