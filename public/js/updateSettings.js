import axios from 'axios';
import { showAlert } from './alert';

//type either password or data
export const updateSettings = async (data, type) => {
  console.log(data);
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/changePassword'
        : `http://localhost:3000/api/v1/users/changeMe`;

    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });
    if (res.data.status == 'success') {
      showAlert('success', `${type} updated successfuly`);
    }
  } catch (err) {
    showAlert('error', 'there was a problem updating your data');
  }
};
