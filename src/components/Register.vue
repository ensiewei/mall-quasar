<template>
  <div class="q-pa-md" style="max-width: 400px">

    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <q-input
        outlined
        v-model="user.username"
        label="用户名 *"
        lazy-rules
        :rules="[ val => val && val.length >= 4 && val.length <= 16 || '用户名长度应为4到16位']"
      />

      <q-input
        outlined
        type="number"
        v-model="user.phone"
        label="手机号 *"
        lazy-rules
        :rules="[
          val => val > 10000000000 && val < 20000000000 || '手机号输入不正确'
        ]"
      />

      <q-input
        outlined
        type="password"
        v-model="user.password"
        label="密码 *"
        lazy-rules
        :rules="[ val => val && val.length >= 6 && val.length <= 16 || '密码长度应为6到16位']"
      />

      <q-input
        outlined
        type="password"
        v-model="repassword"
        label="确认密码 *"
        lazy-rules
        :rules="[
          val => val && val.length >= 6 && val.length <= 16 || '密码长度应为6到16位',
          val => val === user.password || '两次输入的密码不一致'
        ]"
      />

      <div>
        <q-btn label="提交" type="submit" color="primary"/>
        <q-btn label="重置" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>

  </div>
</template>

<script>
import { createMetaMixin } from 'quasar'
export default {
  mixins: [
    createMetaMixin(function () {
      return {
        title: '注册'
      }
    })
  ],
  data () {
    return {
      repassword: undefined,
      user: {}
    }
  },
  methods: {
    onSubmit () {
      this.$q.notify({
        position: 'top',
        timeout: 1000,
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: '提交成功'
      })
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/user/user/register?username=${this.user.username}&phone=${this.user.phone}&key=${this.user.password}`
      }).then(res => {
        if (res.data.code === 0) {
          this.$q.notify({
            position: 'top',
            timeout: 1000,
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: '注册成功'
          })
          this.$router.go(-1)
        } else {
          this.$q.notify({
            position: 'top',
            timeout: 1000,
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: res.data.msg
          })
        }
      }).catch(e => {
        this.$q.notify({
          position: 'center',
          timeout: 1000,
          color: 'red',
          textColor: 'white',
          icon: 'cloud_done',
          message: '服务器好像走丢了，待会儿再试试吧~'
        })
      })
    },

    onReset () {
      this.user = {}
    }
  }
}
</script>
