import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import cors from 'vue-axios-cors'
import 'buefy/dist/buefy.css'

require('dotenv').config()

Vue.use(Buefy)
Vue.use(cors)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
