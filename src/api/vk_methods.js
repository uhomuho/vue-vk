import api from '@/api/api'

export default {
	createSheet(params){
		return api().post(`sheet`, params)
	}
}