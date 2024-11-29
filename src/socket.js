import io from 'socket.io-client'

const newSocket = io("https://telegramback.onrender.com/")

export default newSocket