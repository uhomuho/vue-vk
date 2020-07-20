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
				| {{groups}}
				.columns.is-flex.is-multiline(
					v-if="groups")
					.column.is-4-desktop.is-6-tablet.is-12-mobile(
						v-for="(group, key) in groups.data.groups",
						:key="group")
						.column-container
							.card
								.card-image
									figure.image
										img(
											:src="group.attrs.groupPhoto",
											:alt="group.attrs.groupName")
								.card-content
									.content
										a(
											:href="'http://vk.com/public'+key",
											target="_blank")
											| {{group.attrs.groupName}}
									table.table
										thead
											tr
												td Просмотры
												td Участники
												td Активные участники
										tbody
											tr
												td
													| {{group.average_views}}
													br
													|	{{group.views_k}}
												td
													| {{group.total_members}} 
												td
													|	{{group.total_active_members}}
													br
													| {{group.users_k}}

</template>

<script>
import vk from '@/api/vk_methods'

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
				groupsCount: 30
			}
		}
	},
	methods: {
		async getGroupsInfo(){

			var result = await vk.getGroups(this.formData)
			this.groups = result
		}
	},
	mounted(){
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.columns {
	margin-top: 2rem;
}
</style>
