import { Avatar, Button, Divider, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import { useSelector } from 'react-redux'
import Menu from './Menu/Menu';
import { getGroupId, getUserChatID, imageUrl } from '../../api/url';
import { api } from '../../api';
import newSocket from '../../socket';
import CircleIcon from '@mui/icons-material/Circle';

function Sorted({ usersOnline, setMessageGroup, setSelectGroup, setPhone, setUserName, setUserChat, scrollToBottom, chatSelected, setchatSelected }) {
    const groups = useSelector(state => state.user.groups)

    const [openMenu, setOpenMenu] = useState(false)
    const { user } = useSelector(state => state.user)

    const [sender, setSender] = useState()
    const [receiver, setReceiver] = useState()
    const [receiverMap, setReceiverMap] = useState()
    const [receiverMaps, setReceiverMaps] = useState()
    const [groupName, setGroupName] = useState('')

    useEffect(() => {
        const chatSender = user?.chat?.filter((e) => {
            return e.sender === user.phone && user?.contact?.every((c) => e.sender !== c.contact);
        })

        const chatReceiver = user?.chat?.filter((e) => {
            return e.receiver === user.phone && user?.contact?.every((c) => e.receiver !== c.contact);
        });

        const uniqueMapSender = new Map()

        chatSender?.forEach((item) => {
            if (!uniqueMapSender.has(item.receiver)) {
                uniqueMapSender.set(item.receiver, item);
            }
        })
        const result = Array.from(uniqueMapSender.values());

        setSender(result);

        const uniqueMapReceiver = new Map()

        chatReceiver?.forEach((item) => {
            if (!uniqueMapReceiver.has(item.sender)) {
                uniqueMapReceiver.set(item.sender, item);
            }
        })

        const resultReceiver = Array.from(uniqueMapReceiver.values());
        setReceiver(resultReceiver);
    }, [user?.chat, user?.contact, user.phone])

    const handleGroup = (e) => {
        scrollToBottom()
        setchatSelected(true)
        setGroupName(e.name)
        setUserChat(null)
        setUserName(null)
        setMessageGroup(true)
        setPhone(e.name)
    }

    const [updateGroup, setUpdateGroup] = useState(null);

    useEffect(() => {
        const handleAddUsersGroup = data => setUpdateGroup(data.data);
        const handleAddAdminsGroup = data => setUpdateGroup(data.data);
        const handleEditGroup = data => setUpdateGroup(data.data);
        const handleLeaveUsersGroup = (data) => {
            setUpdateGroup(data.data);
        }
        const handleDeleteGroup = data => setUpdateGroup(data.data);

        newSocket.on('addUsersGroup', handleAddUsersGroup);
        newSocket.on('addAdminsGroup', handleAddAdminsGroup);
        newSocket.on('editGroup', handleEditGroup);
        newSocket.on('leaveUsersGroup', handleLeaveUsersGroup);
        newSocket.on('deletsGroups', handleDeleteGroup);

        return () => {
            newSocket.off('addUsersGroup', handleAddUsersGroup);
            newSocket.off('addAdminsGroup', handleAddAdminsGroup);
            newSocket.off('editGroup', handleEditGroup);
            newSocket.off('leaveUsersGroup', handleLeaveUsersGroup);
            newSocket.off('deletsGroups', handleDeleteGroup);
        };
    }, []);
    console.log(groupName);

    const handleGroupID = useCallback(async () => {
        try {
            const response = await api.get(`${getGroupId}?groupName=${groupName}`);
            console.log(response.data.data, 'group');
            setSelectGroup(response.data.data);
            setUserChat(null);
            setUserName(null);
        } catch (error) {
            console.error(error, 'groupId');
        }
    }, [updateGroup, groupName, setSelectGroup, setUserChat, setUserName]);

    useEffect(() => {
        if (groupName) {
            handleGroupID();
        }
        if (updateGroup && groupName) {
            handleGroupID();
        }
    }, [handleGroupID, groupName, updateGroup]);

    useEffect(() => {
        const senders = sender?.filter((e) => {
            // receiver'dagi sender qiymatini tekshirish
            if (receiver.length > 0) {
                return sender?.some((c) => c.receiver !== e.sender);
            } else if (receiver.length === 0) {
                return sender?.some((c) => c.receiver === e.sender);
            }
            else {
                return sender
            }
        });

        const senderContact = senders?.filter((e) => {
            // user.contact'dagi kontaktni tekshirish
            return user?.contact?.every((c) => c.contact !== e.receiver);
        });
        // setsenderMaps(senderContact)

        const receivers = receiver?.filter((e) => {
            if (sender.length > 0) {
                return receiver?.some((c) => c.receiver !== e.sender);
            } else if (receiver.length === 0) {
                return receiver?.some((c) => c.receiver === e.sender);
            }
            else {
                return sender
            }
        });

        const receiverContact = receivers?.filter((e) => {
            // user.contact'dagi kontaktni tekshirish
            return user?.contact?.every((c) => c.contact !== e.receiver);
        });

        // setReceiverMaps(receiverContact)

        if (senderContact && receiverContact) {
            const uniqueMessages = [...senderContact, ...receiverContact].filter((value, index, self) =>
                // receiver va sender qiymatlarini tekshirish va bir xil bo'lsa faqat birini olish
                index === self.findIndex((t) => (
                    (t.sender === value.sender && t.receiver === value.receiver) ||
                    (t.sender === value.receiver && t.receiver === value.sender) // Ikkinchi holatni tekshirish
                ))
            );
            console.log(uniqueMessages, 'unik');
            setReceiverMaps(uniqueMessages);
        }

    }, [receiver, sender, user?.contact, user?.chat]);

    const handleUser = (e) => {
        scrollToBottom()
        setchatSelected(true)
        setPhone(e.phone)
        setSelectGroup('')
        setGroupName('')
        setUserName(e.name)
        setMessageGroup(false)
    }

    const handleOpen = () => {
        setOpenMenu(!openMenu)
    }

    const handleUserImages = useCallback(async () => {
        // user.contacts uchun API chaqiruvlari
        const userContactPromises = user?.contact?.map(async (e) => {
            try {
                const userResponse = await api.get(getUserChatID, {
                    params: {
                        userPhone: e.contact
                    }
                });
                return userResponse.data.data;
            } catch (error) {
                console.error("Error fetching user by contact:", error);
            }
        }) || [];

        // receiverMaps uchun API chaqiruvlari
        const receiverMapPromises = receiverMaps?.map(async (e) => {
            const contactExists = user?.contact?.some((c) => e.sender === c.contact);
            if (!contactExists) {
                try {
                    const usersResponse = await api.get(getUserChatID, {
                        params: {
                            userPhone: e.receiver !== user?.phone ? e.receiver : e.sender
                        }
                    });
                    return usersResponse.data.data;
                } catch (error) {
                    console.error("Error fetching receiver data:", error);
                }
            }
        }) || [];

        // Barcha va'dalarni parallel bajarish
        const results = await Promise.all([...userContactPromises, ...receiverMapPromises]);

        // Yig'ilgan natijalarni filtrlash va takroriy qiymatlarni olib tashlash
        const uniqueMap = new Map();
        results.forEach((item) => {
            if (item && !uniqueMap.has(item.phone)) {
                uniqueMap.set(item.phone, item);
            }
        });

        const finalResult = Array.from(uniqueMap.values());

        // setUserContactImages va setReceiverMap'ni yangilash
        setReceiverMap(finalResult);
    }, [receiverMaps, user?.contact, user?.phone]);

    useEffect(() => {
        handleUserImages()
    }, [handleUserImages]);

    return (
        <div className={`${chatSelected && window.innerWidth <= 576 ? "hidden" : "block"} bg-slate-900 w-[400px] h-[100vh] overflow-auto`} style={{
            scrollbarWidth: 'none'
        }}>
            {
                openMenu ?
                    <Menu openMenu={handleOpen} setPhone={setPhone} scrollToBottom={scrollToBottom} setUserName={setUserName} />
                    :
                    <>
                        <List sx={{ width: '100%' }}>
                            <Button onClick={handleOpen} >
                                <MenuIcon sx={{ color: "white" }} />
                            </Button>
                            <Divider variant="inset" component="li" />
                            {receiverMap?.map((e, index) => (
                                <div key={index}>
                                    <ListItem alignItems="flex-start">
                                        <div className='relative'>
                                            <ListItemAvatar>
                                                <Avatar
                                                    alt="Remy Sharp"
                                                    src={e?.userImage?.length ? `${imageUrl + e?.userImage?.slice(-1)[0]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'}
                                                />
                                            </ListItemAvatar>
                                            {/* {usersOnline?.includes(e.phone) ?
                                                :
                                                } */}
                                            {usersOnline?.find((c) => c.phone === e.phone) ? (
                                                <CircleIcon
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: '-10px',
                                                        color: "green"
                                                    }}
                                                />
                                            ) : (
                                                <CircleIcon
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: '-10px',
                                                        color: "gray"
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <Button sx={{ width: "100vw" }} onClick={() => handleUser(e)}>
                                            <ListItemText primary={e.name} />
                                        </Button>
                                    </ListItem>
                                </div>
                            ))}
                            <Divider variant="inset" component="li" />
                            {groups?.groups?.map((e) => (
                                <div>
                                    <ListItem alignItems="flex-start">
                                        <div>
                                            <ListItemAvatar>
                                                <Avatar alt="Remy Sharp" src={e.groupImage.length ? `${imageUrl + e.groupImage.slice(-1)[0]}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0QxSZCjz-8JefhrJrJwtL5i7utqDsRhv7Q&s'} />
                                            </ListItemAvatar>
                                        </div>
                                        <Button sx={{ width: "100vw" }} onClick={() => handleGroup(e)}>
                                            <ListItemText
                                                primary={e.name}
                                            />
                                        </Button>
                                    </ListItem>
                                </div>
                            ))}
                        </List>
                    </>
            }
        </div >
    )
}

export default Sorted