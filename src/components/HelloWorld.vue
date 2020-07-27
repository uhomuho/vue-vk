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
										p.help.is-danger(v-if="formData.keyword == ''")
											|Введите ключевое слово!

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
										p.help.is-danger(v-if="formData.usersCount == '' || formData.usersCount == 0")
											|Введите сколько подписчиков просматривать!

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
										p.help.is-danger(v-if="formData.groupsCount == '' || formData.groupsCount == 0")
											|Введите количество просматриваемых групп!

						.column.is-6-desktop.is-6-tablet.is-12-mobile
							.column-container
								.field
									.label
										| Сколько постов просматриваем
									.control
										input.input(
											type="number",
											placeholder="Паблосики",
											v-model="formData.postsCount")
										p.help.is-danger(v-if="formData.postsCount == '' || formData.postsCount == 0")
											|Введите сколько постов сканировать!

					.field
						.control
							input.button(
							type="submit",
							value="Искать")

					.field(v-if="groupsData")
						.control
							.button(@click="createSheet()")
								|Создать табличку
				
					.box.has-background-dark.has-text-white
						.loader.is-loading(v-if="isLoading")
						.columns.is-flex.is-multiline(v-else)
							.column.is-6-desktop.is-12-tablet.is-12-mobile(
								v-for="(group, index) in groupsData",
								v-if="!group.has_error")
								.box.has-background-white
									.media
										.media-left
											img(:src="group.photo", :alt="group.name")
										.media-content
											.content
												h6
													a(
														:href="'https://vk.com/public'+index",
														target="_blank")
														|{{group.name}}
											table.table
												tr
													td Подписчики:
													td {{group.total_members}}
												tr
													td Активные подписчики:
													td {{group.total_active_members}}
												tr
													td Коэффициент активных подписчиков:
													td {{group.active_members_k}}
												tr(v-if="group.average_views")
													td Среднее кол-во просмотров:
													td {{group.average_views}}
												tr(v-if="group.views_k")
													td Среднее кол-во просмотров:
													td {{group.views_k}}

</template>

<script>
import axios from 'axios'
import api from '@/api/vk_methods'

export default {
	name: 'HelloWorld',
	data: ()=>{
		return {
			formData: {
				keyword: 'Цветы',
				usersCount: 1000,
				daysCount: 14,
				groupsCount: 50,
				postsCount: 30,
				errors: {
					keyword: false,
					usersCount: false,
					daysCount: false,
					groupsCount: false,
					postsCount: false
				}
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
			isLoading: false,
			groupsData: null
		}
	},
	methods: {
		delay(index, data) {
			return new Promise(resolve => {
				setTimeout(resolve.bind(null, data), 300*index);
			});
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
			var formData = this.formData
			if (formData.keyword == '' || formData.usersCount == 0 || formData.usersCount == '' || formData.groupsCount == 0 || formData.groupsCount == '' || formData.postsCount == 0 || formData.postsCount == '') {
				return false
			}
			this.isLoading = true
			// Составление параметров для получения массива групп
			var params = {
				q:        			this.formData.keyword,
				type:     			'group',
				count:    			this.formData.groupsCount,
				city_id:  			1,
				sort: 					2
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
					console.log(this.groupsData)
				})
		},
		async processingUsers(){
			// Объявление глобальных переменых на уровне этой функции
			var groups 		= {},
					timestamp = Math.floor(Date.now()/1000),
					unixDaysCount = this.formData.daysCount * 86400,
					index = 0

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
				return await this.delay(index)
					.then(()=>{
						return axios
							.get(`https://uhomuhoproxy.herokuapp.com/https://api.vk.com/method/groups.getMembers?${this.createRequestString(params)}`, {
								headers: {
									'origin': 'x-requested-with'
								}
							})
							.then(async r=>{
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
							.catch((err)=>console.log(err))
					})
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

			var map = await this.processingData.allGroups.map(async group => {
				index++
				views = 0
				var params = {
					owner_id: `-${group.id}`,
					count: 		this.formData.postsCount,
				} 
				// Получение массива юзеров

				return await this.delay(index)
					.then(()=>{
						return axios
							.get(`https://uhomuhoproxy.herokuapp.com/https://api.vk.com/method/wall.get?${this.createRequestString(params)}`, {
								headers: {
									'origin': 'x-requested-with'
								}
							})
							.then(r=>{
								views = 0
								if (!r.data.error) {
									for (var i = 0; i < r.data.response.items.length; i++) {
										if (r.data.response.items) {
											var post = r.data.response.items[i]
											views = views + post.views.count
										}
									}
									groups[group.id]['average_views'] = Math.floor(views/this.formData.postsCount)
									groups[group.id]['views_k'] = groups[group.id]['average_views']/groups[group.id]['total_active_members']
								} else {
									groups[group.id]['has_error'] = true
								}
									return groups
							})
							.catch(err=>console.log(err))
					})

				})
			return Promise.all(map)
				.then(r=>r)
				.then(r=>{
					this.isLoading = false
					// return r
					for (var i = 0; i < r.length; i++) {
						if (r[i] !== undefined) {
							return r[i]
						}
					}
				})
				.then(r=>r)
				.catch(err=>console.error(err))
		},
		async createSheet(){
			var request = await api.createSheet()
			console.log(request)
		}
	},
	mounted(){
		this.createSheet()
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
.box .loader {
	margin: 2rem auto;
	height: 4rem;
	width: 4rem;
}
.media .media-left img {
	max-width: 3rem;
}
.media .media-content .table tr td:last-of-type {
	text-align: right;
}
</style>
