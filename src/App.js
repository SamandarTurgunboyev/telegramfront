import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import Home from './components/pages/Home'
import { useDispatch, useSelector } from 'react-redux'
import { getAllGroup, getUser } from './api/url'
import { api } from './api'
import { addgroups, addUser } from './store/userSlice'
import { useCallback, useEffect, useState } from 'react'
import newSocket from './socket'

function App() {
  const { token } = useSelector(state => state.user)
  const user = useSelector(state => state.user.user)
  const dispatch = useDispatch()

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

  const getUserApi = useCallback(async () => {
    try {
      const user = await api.get(getUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(addUser(user.data.data));
    } catch (error) {
      console.error(error);
    }
  }, [token, dispatch]); // token, dispatch, va getUser dependency massivida bo'lishi kerak

  useEffect(() => {
    getUserApi(); // Endi xavfsiz ishlaydi
  }, [getUserApi]);

  const getAllGroups = useCallback(async () => {
    try {
      const group = await api.get(`${getAllGroup}?phone=${user.phone}`);
      dispatch(addgroups(group.data.data));
    } catch (error) {
      console.log(error);
    }
  }, [user.phone, dispatch]); // Faqat zarur dependencylarni qo'shing

  useEffect(() => {
    getAllGroups();
  }, [getAllGroups]);

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