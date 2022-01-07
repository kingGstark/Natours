import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  await axios({
    method: 'POST',
    url: 'http://localhost:3000/api/v1/users/logIn',
    data: {
      email,
      password,
    },
  })
    .then((response) => {
      if (response.data.status === 'success') {
        showAlert('success', 'Logged successfuly');
        window.setTimeout(() => {
          location.assign('/');
        }, 500);
      }
    })
    .catch((error) => {
      console.log(error);
      showAlert('error', error);
    });
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
