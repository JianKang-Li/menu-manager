import { reactive } from 'vue';

const KEY = 'menu_manager_token';

export const auth = reactive({
  token: localStorage.getItem(KEY) || '',
  username: 'admin',
  get isLogin() {
    return !!this.token;
  },
  login(token) {
    this.token = token;
    localStorage.setItem(KEY, token);
  },
  logout() {
    this.token = '';
    localStorage.removeItem(KEY);
  },
});
