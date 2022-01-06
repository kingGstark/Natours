import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/logIn',
      data: {
        email,
        password,
      },
    });
    if (response.data.status === 'success') {
      showAlert('success', 'Logged successfuly');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.reponse.data);
  }
};

export const logout = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (response.data.status == 'success') location.reload(true);
  } catch (err) {}
};
