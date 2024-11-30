import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import Home from './components/pages/Home'
import { useDispatch, useSelector } from 'react-redux'
import { getAllGroup, getUser } from './api/url'
import { api } from './api'
import { addgroups, addUser } from './store/userSlice'
import { useEffect, useState } from 'react'
import newSocket from './socket'

function App() {
  const { token } = useSelector(state => state.user)
  const user = useSelector(state => state.user.user)
  const [updateGroup, setUpdateGroup] = useState()
  console.log(user, 'app js');

  const [socket, setSocket] = useState()
  const [update, setUpdate] = useState()
  const [updateImage, setUpdateImage] = useState()
  const [deleteChat, setDeleteChat] = useState()
  const dispatch = useDispatch()

  useEffect(() => {
    newSocket.on('message', (data) => {
      setSocket(data)
    })

    newSocket.on('updateUsers', (data) => {
      setUpdate(data)
    })

    newSocket.on('updateImage', (data) => {
      setUpdateImage(data)
    })

    newSocket.on('deletingMessage', (data) => {
      const { deleting } = data
      setDeleteChat(deleting)
    })
  }, [])

  const getUserApi = async () => {
    try {
      const user = await api.get(getUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      dispatch(addUser(user.data.data))
    } catch (error) {
    }
  }

  useEffect(() => {
    if (user.phone) {
      newSocket.emit('userInfo', user.phone);
    }
  }, [user.phone]);

  useEffect(() => {
    const handleContextMenu = (event) => {
      event.preventDefault(); // Brauzerning context menyusini o'chirish
    };

    // Hamma joyda contextmenu hodisasini to'xtatish
    document.addEventListener('contextmenu', handleContextMenu);

    // Component unmounted bo'lganda hodisani tozalash
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      newSocket.emit('userDisconnect', user.phone); // Brauzer yopilishidan oldin ma'lumot yuborish
    });
  })

  useEffect(() => {
    getUserApi()
  }, [socket, update, updateImage, deleteChat, updateGroup])


  const getAllGroups = async () => {
    try {
      const group = await api.get(`${getAllGroup}?phone=${user.phone}`)
      dispatch(addgroups(group.data.data))
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAllGroups()
  }, [user.phone, socket, update, updateImage, deleteChat, updateGroup])


  useEffect(() => {
    const handleAddUsersGroup = data => setUpdateGroup(data.data);
    const handleAddAdminsGroup = data => setUpdateGroup(data.data);
    const handleEditGroup = data => setUpdateGroup(data.data);
    const handleLeaveUsersGroup = data => setUpdateGroup(data.data);
    const handleDeleteGroup = data => setUpdateGroup(data.data);

    newSocket.on('addUsersGroup', handleAddUsersGroup);
    newSocket.on('addAdminsGroup', handleAddAdminsGroup);
    newSocket.on('editGroup', handleEditGroup);
    newSocket.on('leaveUsersGroup', handleLeaveUsersGroup);
    newSocket.on('deletsGroups',  handleDeleteGroup);

    return () => {
      newSocket.off('addUsersGroup', handleAddUsersGroup);
      newSocket.off('addAdminsGroup', handleAddAdminsGroup);
      newSocket.off('editGroup', handleEditGroup);
      newSocket.off('leaveUsersGroup', handleLeaveUsersGroup);
      newSocket.off('deletsGroups', handleDeleteGroup);
    };
  }, []);

  return (
    <>
      <Routes>
        {
          token ?
            <>
              <Route path='/' element={<Home />} />
            </>
            :
            <>
              <Route path='/' element={<Register />} />
              <Route path='/login' element={<Login />} />
            </>
        }
        {token &&
          <>
            <Route path="/home" element={<Home />} />
          </>
        }
      </Routes>
    </>
  )
}

export default App