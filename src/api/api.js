import axios from 'axios'

export default () => {
	return axios.create({
		baseURL: 'https://serene-savannah-08565.herokuapp.com',
		headers: {
			'Content-Type': 'multipart/form-data',
			'Access-Control-Allow-Origin': '*'
		}
	})
}