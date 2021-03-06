import axios from 'axios'

axios.defaults.headers.common['Content-Type'] = 'multipart/form-data'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'

export default () => {
	let url = "//serene-savannah-08565.herokuapp.com"
	if (process.env.NODE_ENV == 'development') {
		url = "//localhost:8081"
	}

	return axios.create({
		baseURL: url
	})
}