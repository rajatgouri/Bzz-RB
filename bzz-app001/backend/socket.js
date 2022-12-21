var sql = require("mssql");
const { getDateTime } = require("./controllers/utilController");
const utilController = require("./controllers/utilController");

const MessageModel = `[COHTEAMS].[dbo].[Messages]`
const ChatModel = `[COHTEAMS].[dbo].[Chat]`

var io;
var Socket; 
module.exports = {
    init: (http) => {
        io = require('socket.io')(http, {
            cors: {
                origin: "*"
            }
        });


        io.on('connection', function (socket) {

            console.log('Connection Setup to socket');

            socket.on('setUserID', async (id) => {
                socket.user = id;
                socket.join(id);


                await sql.query(`update JWT set Online = '1', [Status] = 'Working' where EMPID = ${id}`);
                let { recordset } = await sql.query(`SELECT ID from ${ChatModel} where User1 = '${id}' or User2 = '${id}'`)

                recordset.map(r => {
                    socket.join(r.ID);
                    io.to(r.ID).emit('room-joined', 'room Joined successfully!');
                })


            })

            socket.on('update-wqs', () => {
                io.sockets.emit('updated-wqs');
            })


            socket.on('update-hb-wqs', () => {
                io.sockets.emit('updated-hb-wqs');
            })

            socket.on('update-reminder', () => {
                io.sockets.emit('updated-reminder');
            })


            socket.on('page-logger', (data) => {
                io.sockets.emit('updated-reminder');
                const values = data;

                values.DateTime = utilController.getDateTime()

                const columnsQ = "(" + Object.keys(values).toString() + ")"

                let valuesQuery = "";
                for (key in values) {
                    if (values[key] === "null" || values[key] === null) {
                        valuesQuery += "NULL" + ",";
                    } else {
                        valuesQuery += "'" + values[key] + "',";
                    }
                }

                valuesQuery = "(" + valuesQuery.slice(0, -1) + ")";

                const insertQuery = `insert into [PageLogger] ${columnsQ} values ${valuesQuery}`
                sql.query(insertQuery);

            })


            socket.on('join-room', data => {

                socket.join(data.room);
                io.to(data.room).emit('room-joined', 'room Joined successfully!');
                console.log('room joined successfully!')
            })


            socket.on('typing', (data) => {
                io.to(data.room).emit('on-typing', true);

            })





            socket.on('new-message', async (data) => {

                io.to(data.room).emit
                    ('on-new-message', {
                        Chat: data.room,
                        To: data.to,
                        From: data.from,
                        Message: data.message,
                        UploadDateTime: utilController.getDateTime()
                    });

                await sql.query(`INSERT INTO ${MessageModel} ([Chat], [To], [From], [Message],[UploadDateTime]) values ('${data.room}', '${data.to}', '${data.from}', '${data.message}', '${utilController.getDateTime()}')`)
                await sql.query(`UPDATE ${ChatModel} set [LastMsg] = '${data.message.substring(0, 25)}' , [DateTime] = '${utilController.getDateTime()}' where ID = ${data.room}`)

            })

            socket.on('unread-message', async (data) => {
                let { recordset } = await sql.query(`Select [User1], [User2] from  ${ChatModel}  where ID = ${data.room}`)
                if (recordset[0]['User1'] == data.to) {

                    await sql.query(`Update  ${ChatModel} set  [Unread1] =  ISNULL([Unread1], 0) + 1  where ID = ${data.room}`)
                } else if (recordset[0]['User2'] == data.to) {

                    await sql.query(`Update  ${ChatModel} set  [Unread2] =  ISNULL([Unread2], 0) + 1  where ID = ${data.room}`)
                }
            })


            socket.on('read-message', async (data) => {
                let { recordset } = await sql.query(`Select [User1], [User2] from  ${ChatModel}  where ID = ${data.room}`)

                if (recordset[0]['User1'] == data.to) {

                    await sql.query(`Update  ${ChatModel} set  [Unread2] =  NULL  where ID = ${data.room}`)
                } else if (recordset[0]['User2'] == data.to) {

                    await sql.query(`Update  ${ChatModel} set  [Unread1] =  NULL  where ID = ${data.room}`)
                }
            })

            socket.on('disconnect', function () {

                io.sockets.emit('updated-wqs');
                if (socket.user == undefined) {
                    return
                }
                sql.query(`update JWT set Online = '0' where EMPID = ${socket.user}`);


            });

            socket.on('get-soc-count', async function () {

                let { recordset: SOC } = await sql.query(`SELECT COUNT(*) as count from WQ1262 where [Status] = 'Review' and [SOC Flag] IS NOT NULL`)
                io.sockets.emit('soc-count', SOC);



            });


            socket.on('disconnected', function () {

                io.sockets.emit('updated-wqs');
                if (socket.user == undefined) {
                    return
                }
                sql.query(`update JWT set Online = '0' where EMPID = ${socket.user}`);






            });


        })


    },
    get: async () => {

        await setTimeout(() => {}, 5000)
        if (!io) {
            throw new Error("socket is not initialized");
        }
        return io;
    },
    
    emit: (event, data) => {

        io.sockets.emit(event, data)
    }
}

