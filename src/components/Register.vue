<template>
  <div class="q-pa-md" style="max-width: 400px">

    <q-form
      @submit="onSubmit"
      @reset="onReset"
      class="q-gutter-md"
    >
      <q-input
        filled
        v-model="user.username"
        label="Your name *"
        lazy-rules
        :rules="[ val => val && val.length >= 4 && val.length <= 16 || 'Please type something (length range [4,16])']"
      />

      <q-input
        filled
        type="number"
        v-model="user.phone"
        label="Your phone *"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || 'Please type your phone',
          val => val > 0 && val < 20000000000 || 'Please type a real phone'
        ]"
      />

      <q-input
        filled
        type="password"
        v-model="user.password"
        label="Your password *"
        lazy-rules
        :rules="[ val => val && val.length >= 6 && val.length <= 16 || 'Please type something (length range[6,16])']"
      />

      <q-input
        filled
        type="password"
        v-model="repassword"
        label="Your repassword *"
        lazy-rules
        :rules="[
          val => val && val.length >= 6 && val.length <= 16 || 'Please type something (length range[6,16])',
          val => val === user.password || 'The two passwords are different'
        ]"
      />

      <div>
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>

  </div>
</template>

<script>
export default {
  data () {
    return {
      repassword: undefined,
      user: {}
    }
  },
  methods: {
    onSubmit () {
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Submitted'
      })
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://106.55.156.192:5797/api/user/user/register?username=${this.user.username}&phone=${this.user.phone}&key=${this.user.password}`
      }).then(res => {
        if (res.data.code === 0) {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'register success'
          })
          this.$router.go(-1)
        } else {
          this.$q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: res.data.msg
          })
        }
      }).catch(e => {
        console.log(e)
      })
    },

    onReset () {
      this.user = {}
    }
  }
}
</script>
