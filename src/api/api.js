import axios from 'axios'

axios.defaults.headers.common['Content-Type'] = 'multipart/form-data';
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export default () => {
	return axios.create({
		baseURL: 'http://localhost:8081'
	})
}