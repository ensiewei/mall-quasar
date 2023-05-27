<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-btn dense flat round @click="routerBack()" label="< 返回" class="q-mr-md"/>
        <q-form
          @submit="onSearch"
          class="q-gutter-md"
        >
          <q-input dark dense standout v-model="query.match" autofocus :placeholder="placeholder">
            <template v-slot:append>
              <q-icon name="search" @click="onSearch" />
            </template>
          </q-input>
        </q-form>
        <q-btn dense flat round icon="menu" @click="rightDrawerOpen = !rightDrawerOpen" v-if="this.skus.length > 0" label="筛选" class="q-ml-lg" />
      </q-toolbar>

    </q-header>

    <q-drawer :model-value="rightDrawerOpen" side="right" bordered overlay @hide="this.rightDrawerOpen = false">
      <div class="q-pa-md">
        <div class="q-ma-xs text-blod">价格区间</div>
        <div>
          <q-input outlined v-model="priceGte" label="最低价" type="number" class="q-ma-xs" />
          <q-input outlined v-model="priceLte" label="最高价" type="number" class="q-ma-xs" />
          <q-btn-group spread class="q-ma-xs">
            <q-btn label="重置" @click="resetPrice()" />
            <q-btn color="primary" label="确认" @click="initialData()" />
          </q-btn-group>
        </div>
      </div>
      <div class="q-pa-md" v-for="(value, name, index) in groups" :key="index">
        <div class="q-ma-xs text-blod">{{ name }}</div>
        <div>
          <q-btn no-caps class="q-ma-xs" :color="isClicked(name, v) ? 'green': 'primary'" :label="v" v-for="(v, index) of value" :key="index" @click="onBtn(name, v)" />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-btn-group spread class="q-ma-xs" v-if="skus.length > 0">
          <q-btn :color="query.sort === 0 ? 'green' : 'primary'" label="综合推荐" @click="sortDefault()"/>
          <q-btn :color="query.sort !== 0 ? 'green' : 'primary'" :label="priceLabel()" @click="sortPrice()"/>
        </q-btn-group>
      <div class="q-pa-md" style="max-width: 100%">
        <q-infinite-scroll @load="onLoad" :offset="250" v-if="skus.length > 0" :scroll-target="scrollTarget">
          <q-list>
          <q-item clickable v-ripple v-for="(v, i) of skus" :key="i" @click="openNewPage(v.id)">
            <q-item-section thumbnail>
              <img :src="v.image">
            </q-item-section>
            <q-item-section class="q-pa-md">
              <span v-html="v.title"></span>
            </q-item-section>
            <q-item-section v-html="'￥ ' + (v.price / 100)" class="text-bold" ></q-item-section>
          </q-item>
          </q-list>
          <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
          </template>
        </q-infinite-scroll>
        <div v-if="separator">
          <q-separator></q-separator>
          <p class="text-center">再怎么找也没有了</p>
        </div>
      </div>
      <q-icon name="o_arrow_drop_up" style="margin-bottom:100px" size="xl" color="primary" class="fixed-bottom-right q-ma-md bg-grey-4 rounded-borders" @click="onScroll" v-if="skus.length > 0"/>
    </q-page-container>

  </q-layout>
</template>

<script>
import { createMetaMixin } from 'quasar'
export default {
  mixins: [
    createMetaMixin(function () {
      return {
        title: '搜索'
      }
    })
  ],
  data () {
    return {
      scrollTarget: 0,
      priceGte: undefined,
      priceLte: undefined,
      placeholder: '手机',
      rightDrawerOpen: false,
      model: undefined,
      skus: [],
      groups: undefined,
      separator: false,
      query: {
        match: undefined,
        terms: undefined,
        gte: undefined,
        lte: undefined,
        from: undefined,
        sort: 0
      }
    }
  },
  methods: {
    initialData () {
      this.query.match = this.query.match || this.placeholder
      this.query.gte = this.priceGte ? this.priceGte * 100 : undefined
      this.query.lte = this.priceLte ? this.priceLte * 100 : undefined
      this.query.from = undefined
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/commodity/sku/query`,
        data: this.query
      }).then(res => {
        this.groups = res.data.groups
        this.skus = res.data.skus
        if (this.skus.length === 0) {
          this.$q.notify({
            position: 'center',
            timeout: 1000,
            color: 'red',
            textColor: 'white',
            icon: 'cloud_done',
            message: '什么都没找到...'
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
    onSearch () {
      this.$q.notify({
        position: 'center',
        timeout: 1000,
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: '努力检索中...'
      })
      this.initialData()
    },
    onBtn (name, value) {
      this.query.terms = this.query.terms || {}
      if (!this.query.terms[name]) this.query.terms[name] = value
      else delete this.query.terms[name]
      this.initialData()
    },
    isClicked (name, value) {
      this.query.terms = this.query.terms || {}
      if (this.query.terms[name] === value) return true
      return false
    },
    openNewPage (id) {
      const url = this.$router.resolve(String(id))
      window.open(url.href, '_blank')
    },
    resetPrice () {
      this.priceGte = undefined
      this.priceLte = undefined
    },
    routerBack () {
      this.$router.back()
    },
    onLoad (index, done) {
      this.query.gte = this.priceGte ? this.priceGte * 100 : undefined
      this.query.lte = this.priceLte ? this.priceLte * 100 : undefined
      this.query.from = this.skus.length
      this.$axios({
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        url: `http://${window.location.hostname}:88/api/commodity/sku/query`,
        data: this.query
      }).then(res => {
        this.groups = res.data.groups
        this.skus = this.skus.concat(res.data.skus)
        if (res.data.skus.length !== 20) {
          done(true)
          this.separator = true
        } else {
          done(false)
          this.separator = false
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
    onScroll () {
      window.scrollTo(0, 0)
    },
    sortPrice () {
      switch (this.query.sort) {
        case 0:
          this.query.sort = 1
          this.initialData()
          break
        case 1:
          this.query.sort = 2
          this.initialData()
          break
        case 2:
          this.query.sort = 1
          this.initialData()
          break
        default:
          break
      }
    },
    sortDefault () {
      this.query.sort = 0
      this.initialData()
    },
    priceLabel () {
      switch (this.query.sort) {
        case 0:
          return '价格↑↓'
        case 1:
          return '价格↓'
        case 2:
          return '价格↑'
        default:
          break
      }
    }
  }
}
</script>
