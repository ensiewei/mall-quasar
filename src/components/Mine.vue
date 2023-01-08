<template>
  <q-layout view="hHh lpR fFf">

    <q-page-container>
      <div class="q-pa-md">
        <q-btn-group spread>
          <q-btn v-if="user" color="primary" :label="user.username" icon="people" />
          <q-btn v-else color="primary" label="登录/注册" icon="people" @click="login" />
          <q-btn v-if="user" color="green" label="登出" icon="logout" @click="logout" />
        </q-btn-group>
      </div>
      <div class="q-pa-md">
        <q-btn-group spread>
          <q-btn color="primary" label="我的订单" to="order" />
        </q-btn-group>
      </div>
    </q-page-container>

    <q-footer class="bg-white">
      <div class="q-pa-md">
        <q-btn-group spread>
          <q-btn color="primary" label="首页" to="/" />
          <q-btn color="primary" label="购物车" to="/cart" />
          <q-btn color="primary" label="我的" to="/mine" />
        </q-btn-group>
      </div>
    </q-footer>

  </q-layout>
</template>

<script>
export default {
  data () {
    return {
      user: undefined
    }
  },
  methods: {
    login () {
      this.$router.push('/login')
    },
    logout () {
      this.$q.cookies.remove('token')
      this.$router.go(0)
    }
  },
  created () {
    const token = this.$q.cookies.get('token')
    if (token) {
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://49.234.30.114:88/api/user/user/authenticate?token=${token}`
      }).then(res => {
        if (res.data.code === 0) {
          this.user = res.data.user
        } else {
          this.$q.cookies.remove('token')
        }
      })
    }
  }
}
</script>
