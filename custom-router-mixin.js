import PropertyMixin from 'node_modules/backed/mixins/property-mixin.min.js';
export default class CustomRouterMixin extends PropertyMixin(HTMLElement) {
  constructor() {
    const properties = {
      route: {
        value: null,
        reflect: true,
        observer: '__routeObserver'
      },

      /**
       * whenever visited site isn't a valid one router will return selected fallback url
       */
      fallback: {
        value: '404'
      },

      /**
       * Array of routes
       */
      routes: {
        value: []
      },

      /**
       * place ! after hash or not
       */
      hashbang: {
        value: false
      },

      /**
       * @param {string|regexp} pattern
       */
      pattern: {
        value: null
      }
    }
    Object.assign(options.properties, properties);
    super(options);
  }
  ready() {
    this._onHashChange = this._onHashChange.bind(this);
    window.addEventListener('hashchange', this._onHashChange);
    this._onHashChange({newURL: location.href});
  }

  parseURL(url) {
    const pattern = this.pattern ? this.pattern : this.hashbang ? '#!/' : '#/';
    url = url.split(pattern);
    // whenever url[1] is empty or url is undefined, return null
    if (url && !url[1] || url && url[1].length === 0 || !url || url && !url[1]) return null;
    else return url[1];
  }

  _onHashChange(event) {
    const route = this.parseURL(event.newURL);
    if (this.route !== route) {
      this.route = route;
      this.__routeObserver({value: this.route});
      this.dispatchEvent(new CustomEvent('route-change', {detail: this.route}));
    }
  }

  __routeObserver({value}) {
    // check if route exists
    // TODO: parseURL & get subroute ...
    if (this.routes.indexOf(value) === -1) value = this.fallback;
    location.hash = this.hashbang ? `!/${value}` : `/${value}`;
  }
};
