<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-form
          @submit="onSearch"
          class="q-gutter-md"
        >
          <q-input dark dense standout v-model="text" autofocus>
            <template v-slot:append>
              <q-icon name="search" @click="onSearch" />
            </template>
          </q-input>
        </q-form>
        <q-btn dense flat round icon="menu" @click="rightDrawerOpen = !rightDrawerOpen" />
      </q-toolbar>

    </q-header>

    <q-drawer :model-value="rightDrawerOpen" side="right" bordered overlay>
      <div class="q-pa-md" v-for="(value, name, index) in group" :key="index">
        <div class="text-subtitle2" >{{ name }}</div>
        <div>
          <q-btn :color="isClicked(name, v) ? 'red': 'primary'" :label="v" v-for="(v, index) of value" :key="index" @click="onBtn(name, v)" />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <div class="q-pa-md" style="max-width: 100%">
        <q-list>
          <q-item clickable v-ripple v-for="(value, index) of sku" :key="index" @click="openNewPage(value[0].id)">
            <q-item-section thumbnail>
              <img :src="value[0].image">
            </q-item-section>
            <q-item-section v-html="value[0].title"></q-item-section>
            <q-item-section v-html="'￥ ' + (value[0].price / 100)" ></q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-page-container>

  </q-layout>
</template>

<script>
export default {
  data () {
    return {
      text: '',
      rightDrawerOpen: false,
      model: undefined,
      sku: undefined,
      group: undefined,
      query: {
        match: undefined,
        terms: undefined,
        gte: undefined,
        lte: undefined
      }
    }
  },
  methods: {
    fetchData () {
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: 'http://106.55.156.192:5797/api/commodity/sku/query',
        data: this.query
      }).then(res => {
        this.group = res.data.group
        this.sku = res.data.sku
      }).catch(e => {
        console.log(e)
      })
    },
    onSearch () {
      if (!this.text || this.text === '') {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: '你什么都还没输入呢'
        })
        return
      }
      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: '努力检索中...'
      })
      this.query = {
        match: this.text
      }
      this.fetchData()
    },
    onBtn (name, value) {
      this.query.terms = this.query.terms || {}
      if (!this.query.terms[name]) this.query.terms[name] = value
      else delete this.query.terms[name]
      this.fetchData()
    },
    isClicked (name, value) {
      this.query.terms = this.query.terms || {}
      if (this.query.terms[name] === value) return true
      return false
    },
    openNewPage (id) {
      const url = this.$router.resolve(String(id))
      window.open(url.href, '_blank')
    }
  }
}
</script>
