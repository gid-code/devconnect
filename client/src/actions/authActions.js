import {
  GET_ERRORS, SET_CURRENT_USER
} from './type'
import setAuthToken from '../utils/setAuthHeader'
import jwt_decode from 'jwt-decode'
import axios from 'axios'

//register
export const registerUser = (userData, history) => dispatch => {
  axios.post('api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err => 
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      }))
}

//login - get token
export const loginUser = userData => dispatch => {
  axios.post('api/users/login', userData)
    .then(res => {
      //save to localstorage
      const { token } = res.data
      //set token to ls
      localStorage.setItem('jwtToken',token)
      //set token to auth header
      setAuthToken(token)
      //decode token
      const decoded = jwt_decode(token)
      //set auth user
      dispatch(setCurrentUser(decoded))
    } )
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      }))
}

//set currentUser
export const setCurrentUser = decoded => {
  return {
    type:SET_CURRENT_USER,
    payload: decoded
  }
}

//Log user out
export const logoutUser = () => dispatch => {
  //remove token from localstorage
  localStorage.removeItem('jwtToken')
  //remove auth header
  setAuthToken(false)
  //set current user and isAuthenticated
  dispatch(setCurrentUser({}))
  window.location.href = '/'
}