<template lang="pug">
	.section
		.container
			.content
				h1
					| Выборка подходящих групп 
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
							| {{ groupsData }}


</template>

<script>
import axios from 'axios'

export default {
	name: 'HelloWorld',
	data: ()=>{
		return {
			formData: {
				keyword: 'Цветы',
				usersCount: 1,
				daysCount: 14,
				groupsCount: 2,
				postsCount: 30
			},
			vk: {
				accessToken: '1dffe21dab528604255477a812b7853f4367fdd910a88e9a42504327abd3199287205b8e4356dfc743baf',
				v: 5.84
			},
			processingData: {
				allGroups: null,
				activeUsersCount: null,
				groupsData: null
			},
			groupsData: {}
		}
	},
	methods: {
		delay(index) {
			setTimeout(function(){}, 1000*index)
		},
		createRequestString(obj) {
			// Создание строки с параметрами для доступа к апишке
			var result,
					count = 1
			obj.access_token = '1dffe21dab528604255477a812b7853f4367fdd910a88e9a42504327abd3199287205b8e4356dfc743baf'
			obj.v = 5.84
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
		async getGroupsInfo(){
			// Составление параметров для получения массива групп
			var params = {
				q:        			this.formData.keyword,
				type:     			'group',
				count:    			this.formData.groupsCount,
				city_id:  			1
			}

			// Получение массива групп
			axios
				.get(`https://uhomuhoproxy.herokuapp.com/https://api.vk.com/method/groups.search?${this.createRequestString(params)}`, {
					headers: {
						'origin': 'x-requested-with'
					}
				})
				.then(async r=>{
					// Помещаем все группы в переменную компонента
					this.processingData.allGroups = r.data.response.items

					// Запускаем функцию перебора юзеров каждой группы
					this.processingData.groupsData = await this.processingUsers()
					this.groupsData = await this.processingPosts()
				})
		},
		async processingUsers(){
			// Объявление глобальных переменых на уровне этой функции
			var groups 		= {},
					timestamp = Math.floor(Date.now()/1000),
					unixDaysCount = this.formData.daysCount * 86400,
					index = 0
					// currentTime,
					// lastSeen
			var map = this.processingData.allGroups.map(async (group)=>{
				groups[group.id] = {}
				groups[group.id]['photo'] = group.photo_200
				groups[group.id]['name'] = group.name
				index++
				// Составление параметров для получения массива юзеров
				var params = {
					group_id: group.id,
					count: 		this.formData.usersCount,
					fields: 	'last_seen, is_closed, deactivated'
				} 
				// Получение массива юзеров
				await this.delay(index)
				return axios
					.get(`https://uhomuhoproxy.herokuapp.com/https://api.vk.com/method/groups.getMembers?${this.createRequestString(params)}`, {
						headers: {
							'origin': 'x-requested-with'
						}
					})
					.then(r=>{
						if (!r.data.error) {
							this.processingData.activeUsersCount = 0
							for (var i=0; i < r.data.response.items.length; i++) {
								var user = r.data.response.items[i]

								if (user.last_seen) {
									var different = timestamp - user.last_seen.time

									if (user.deactivated !== 'banned' && user.deactivated !== 'deleted') {
										if (different < unixDaysCount) {
											this.processingData.activeUsersCount = i+1
											groups[group.id]['has_error'] = false
										}
									}
								} else {
									groups[group.id]['has_error'] = true
								}
							}
							groups[group.id]['active_members_k'] = this.processingData.activeUsersCount/this.formData.usersCount
							groups[group.id]['total_active_members'] = Math.floor(groups[group.id]['active_members_k'] * r.data.response.count)
							groups[group.id]['total_members'] = r.data.response.count
						} else {
							delete groups[group.id]
						}
						return groups
					})
					.catch(err=>console.error(err))
			})
			return Promise.all(map)
				.then(r=>r)
				.then(r=>r)
				.catch(err=>console.error(err))
		},
		async processingPosts(){
			var groups = this.processingData.groupsData[0],
					index = 0,
					views

			var map = this.processingData.allGroups.map(async group => {
				index++
				views = 0
				var params = {
					owner_id: `-${group.id}`,
					count: 		this.formData.postsCount,
				} 
				// Получение массива юзеров
				await this.delay(index)
				return axios
					.get(`https://uhomuhoproxy.herokuapp.com/https://api.vk.com/method/wall.get?${this.createRequestString(params)}`, {
						headers: {
							'origin': 'x-requested-with'
						}
					})
					.then(r=>{
						views = 0
						for (var i = 0; i < r.data.response.items.length; i++) {
							if (r.data.response.items) {
								var post = r.data.response.items[i]
								views = views + post.views.count
							}
						}
						groups[group.id]['average_views'] = Math.floor(views/this.formData.postsCount)
						groups[group.id]['views_k'] = groups[group.id]['average_views']/groups[group.id]['total_active_members']
						return groups
					})
					.catch(err=>console.log(err))

				})
			return Promise.all(map)
				.then(r=>r)
				.then(r=>r)
				.catch(err=>console.error(err))
		}
	},
	mounted(){
		this.getGroupsInfo()
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
