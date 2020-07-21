<template lang="pug">
	.section
		.container
			.content
				h1
					| Выборка подходящих групп {{ token }}
				form.form(@submit.prevent="getGroupsInfo()")
					.columns.is-multiline.is-flex
						.column.is-6-desktop.is-6-tablet.is-12-mobile
							.column-container
								.field
									.label
										| Ключевое слово
									.control
										input.input(
											type="text",
											placeholder="Ключевое слово",
											v-model="formData.keyword")

						.column.is-6-desktop.is-6-tablet.is-12-mobile
							.column-container
								.field
									.label
										| Количество просматриваемых юзеров
									.control
										input.input(
											type="number",
											placeholder="Юзеры",
											v-model="formData.usersCount")

						.column.is-6-desktop.is-6-tablet.is-12-mobile
							.column-container
								.field
									.label
										| Сколько дней назад были онлайн
									.control
										input.input(
											type="number",
											placeholder="Дни",
											v-model="formData.daysCount")

						.column.is-6-desktop.is-6-tablet.is-12-mobile
							.column-container
								.field
									.label
										| Сколько пабликов просматриваем
									.control
										input.input(
											type="number",
											placeholder="Паблосики",
											v-model="formData.groupsCount")

					.field
						.control
							input.button(
							type="submit",
							value="Искать")
				
					.box.has-background-dark.has-text-white
						pre
							| {{ groups }}
</template>

<script>
import axios from 'axios'
axios.defaults.headers.common['Content-Type'] = 'multipart/form-data'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'

export default {
	name: 'HelloWorld',
	data: ()=>{
		return {
			groups: null,
			token: null,
			formData: {
				keyword: 'Цветы',
				usersCount: 1000,
				daysCount: 14,
				groupsCount: 30,
			},
			vk: {
				accessToken: '1dffe21dab528604255477a812b7853f4367fdd910a88e9a42504327abd3199287205b8e4356dfc743baf',
				v: 5.21
			}
		}
	},
	methods: {
		createRequestString(obj) {
			var result,
					count = 1

			for (var [key, value] of Object.entries(obj)) {
				if (count == 1) {
					result = `${key}=${value}`
				} else {
					result = result+`&${key}=${value}`
				}
				count++
			}
			return result
		},
		vkapi(method, params) {
			axios
				.get(`https://api.vk.com/method/${method}?${
			this.createRequestString(params)}`)
				.then(response => console.log(response))
		},
		async getGroupsInfo(){
			var params = {
				q:        this.formData.keyword,
				type:     'group',
				count:    this.formData.groupsCount,
				city_id:  1,
				access_token:    this.vk.accessToken,
				v:        this.vk.v
			}

			this.vkapi('groups.search', params)
			// var vk = new VK({
			// })
			// var response = await vk.api.groups.search({
				
			// })
		}
	},
	mounted(){
		this.getGroupsInfo()
			.then(data=>console.log(data))
			.catch(err=>console.log(err))
	}
}
</script>

<style scoped>
.columns {
	margin-top: 2rem;
}
.box {
	text-align: left;
}
.box pre {
	background: transparent;
	color: #fff;
}
</style>
