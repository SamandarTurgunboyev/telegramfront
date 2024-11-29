import { useCallback, useEffect, useRef, useState } from 'react'
import '../../App.css'
import Chat from './Chat'
import Sorted from './Sorted'
import { useSelector } from 'react-redux'
import { api } from '../../api'
import { getUserChatID } from '../../api/url'
import newSocket from '../../socket'

function Home() {
    const userApi = useSelector(state => state.user.user)
    const [user, setUser] = useState()

    const [phone, setUserContact] = useState('')

    const [userName, setUserName] = useState('')

    const [chat, setChat] = useState([])

    const [userChat, setUserChat] = useState()

    const [getUser, setGetUser] = useState();
    const [groupMessage, setMessageGroup] = useState(false)

    const [userNetwork, setUserNetwork] = useState()

    const endOfMessagesRef = useRef(null);
    const [selectChat, setSelectChat] = useState()
    const [usersOnline, setUsersOnline] = useState([])

    const [selectGroup, setSelectGroup] = useState(null)

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };


    useEffect(() => {
        newSocket.on('userInfo', (data) => {
            console.log('User info received:', data); // Kelyapgan ma'lumotlarni tekshirish
            setUsersOnline(data);
        });

        newSocket.on('userDis', (data) => {
            console.log('User disconnect event received:', data); // Kelyapgan ma'lumotlarni tekshirish
            setUsersOnline(data);
        });

        return () => {
            newSocket.off('userInfo');
            newSocket.off('userDis');
        };
    }, [phone])

    useEffect(() => {
        const chat = userApi?.chat?.filter((e) => {
            return e.receiver?.includes(phone) || e.sender.includes(phone)
        })
        if (chat?.length) {
            setChat(chat)
        }
        else {
            const con = userApi?.contact?.filter((e) => {
                return e.contact?.includes(phone)
            })
            setChat(con)
        }

        return () => {
            newSocket.off('userInfo');
            newSocket.off('userDis');
        };
    }, [phone, userApi?.chat, userApi?.contact])

    const getUserId = useCallback(async () => {
        try {
            const user = await api.get(getUserChatID, {
                params: {
                    userPhone: phone
                }
            })
            setGetUser(user.data.data)
        } catch (error) {
        }
    }, [phone])

    useEffect(() => {
        getUserId()
    }, [getUserId])

    const [chatSelected, setchatSelected] = useState(false)
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Oyna o'lchami o'zgarganda chaqiriladigan funksiyani qo'shamiz
        window.addEventListener('resize', handleResize);

        // Komponent o'chirilganda hodisani olib tashlaymiz
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (windowWidth >= 576) {
            setchatSelected(false)
        }

        if ((windowWidth <= 576) && (getUser || selectGroup)) {
            setchatSelected(true)
        }
    }, [windowWidth, getUser, selectGroup])



    const handleClick = (event) => {
        if (event.button === 0) { // 0 — bu chap tugma
            event.stopPropagation();
            setMenuVisible(false);
            console.log('Chap tugma bosildi');
            newSocket.emit('deleteMessage', {
                deleting: false
            })
        }
    };

    const handleContextMenu = (event, iteam) => {
        event.preventDefault(); // Standart contextmenu ni o'chirish

        // Mening contextmenu joylashuvini sozlash
        setMenuPosition({ x: event.pageX, y: event.pageY });
        setMenuVisible(true);
        setSelectChat(iteam)
    };

    const [receiver, setReceiver] = useState([])

    useEffect(() => {
        if (selectGroup) {
            setChat(null)
            setGetUser(null)
        }
    }, [selectGroup, getUser])

    console.log(selectGroup, 'group select');


    return (
        <div className='flex overflow-hidden w-full bg-slate-700' onClick={handleClick}>
            <Sorted selectGroup={selectGroup} setMessageGroup={setMessageGroup} usersOnline={usersOnline} setSelectGroup={setSelectGroup} setUserNetwork={setUserNetwork} setReceivers={setReceiver} getUser={getUser} scrollToBottom={scrollToBottom} setchatSelected={setchatSelected} chatSelected={chatSelected} setUser={setUser} setPhone={setUserContact} setUserName={setUserName} userPhone={user} setUserChat={setUserChat} phone={phone} />
            {windowWidth <= 576 ?
                <>
                    {chatSelected &&
                        <Chat setGetUser={setGetUser} setchatSelected={setchatSelected} setSelectGroup={setSelectGroup} groupMessage={groupMessage} selectGroup={selectGroup} usersOnline={usersOnline} userNetwotk={userNetwork} setSelectChat={setSelectChat} receivers={receiver} menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuPosition={menuPosition} setMenuPosition={setMenuPosition} handleContextMenu={handleContextMenu} chatSelected={chatSelected} scrollToBottom={scrollToBottom} endOfMessagesRef={endOfMessagesRef} chat={chat} phoneRec={phone} userName={userName} userChat={userChat} getUser={getUser} selectChat={selectChat} />
                    }
                </>
                :
                <>
                    {getUser?._id ?
                        <Chat setSelectGroup={setSelectGroup} setchatSelected={setchatSelected} groupMessage={groupMessage} selectGroup={selectGroup} usersOnline={usersOnline} userNetwotk={userNetwork} setSelectChat={setSelectChat} receivers={receiver} menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuPosition={menuPosition} setMenuPosition={setMenuPosition} handleContextMenu={handleContextMenu} chatSelected={chatSelected} scrollToBottom={scrollToBottom} endOfMessagesRef={endOfMessagesRef} chat={chat} phoneRec={phone} userName={userName} userChat={userChat} getUser={getUser} selectChat={selectChat} />
                        : selectGroup &&
                        <Chat setSelectGroup={setSelectGroup} setchatSelected={setchatSelected} groupMessage={groupMessage} selectGroup={selectGroup} usersOnline={usersOnline} userNetwotk={userNetwork} setSelectChat={setSelectChat} receivers={receiver} menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuPosition={menuPosition} setMenuPosition={setMenuPosition} handleContextMenu={handleContextMenu} chatSelected={chatSelected} scrollToBottom={scrollToBottom} endOfMessagesRef={endOfMessagesRef} chat={chat} phoneRec={phone} userName={userName} userChat={userChat} getUser={getUser} selectChat={selectChat} />
                    }
                </>
            }
        </div>
    )
}

export default Home