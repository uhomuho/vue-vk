import api from '@/api/api'

export default {
	getGroups(params){
		return api().post(`groups`, params)
	}
}