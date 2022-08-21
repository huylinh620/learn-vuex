import Vuex from 'vuex'
import Vue from 'vue'
import shop from '@/api/shop'

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    products: [],
    cart: [],
    checkoutStatus: null
  },

  getters: { // computed properties
    availableProducts (state, getters) {
      return state.products.filter(product => product.inventory > 0)
    },

    cartProducts(state) {
      return state.cart.map(cartItem => {
        const product = state.products.find(product => product.id === cartItem.id)
        return {
          title: product.title,
          price: product.price,
          quanlity: cartItem.quanlity
        }
      })
    },

    cartTotal(state, getters) {
      return getters.cartProducts.reduce((total, product) => {
        return total + product.price * product.quanlity
      }, 0)
    },

    productIsInStock() {
      return (product) => {
        return product.inventory > 0
      }
    }
  },

  actions: {
    fetchProducts({commit}) {
      return new Promise((resolve, reject) => {
        //make the api
        // Call setProducts mutations
        shop.getProducts(products => {
          commit('setProducts', products)
          resolve()
        })
      })
    },

    addProductToCart({state, getters, commit}, product) {
      if (getters.productIsInStock(product)) {
        const cartItem = state.cart.find(item => item.id === product.id)
        // find cartItem
        if (!cartItem) {
          commit('pushProductToCart', product.id)
        } else {
          commit('incrementItemQuantity', cartItem)
        }
        commit('decrementProductInventory', product)
      }
    },

    checkOut({state, commit}) {
      shop.buyProducts(
        state.cart,
        () => {
          commit('emptyCart')
          commit('setCheckoutStatus', 'success')
        },
        () => {
          commit('setCheckoutStatus', 'fail')
        }
      )
    }
  },

  mutations: {
    setProducts(state, products) {
      //update product
      state.products = products
    },

    pushProductToCart(state, productId) {
      state.cart.push({
        id: productId,
        quanlity: 1
      })
    },

    incrementItemQuantity(state, cartItem) {
      cartItem.quanlity++
    },

    decrementProductInventory(state, product) {
      product.inventory--
    },


    setCheckoutStatus(state, status) {
      state.checkoutStatus = status
    },

    emptyCart (state) {
      state.cart = []
    }
  }
})