import PropertyMixin from './../backed/mixins/property-mixin.min.js';
import merge from './../lodash/merge.js';
export default base => {
  return class CustomRouterMixin extends PropertyMixin(base) {
    constructor(options = {}) {
      const properties = {
        route: {
          value: null,
          // reflect: true,
          observer: '__routeObserver'
        },

        startRoute: {
          value: '/',
          observer: '__routeObserver'
        },

        /**
         * whenever visited site isn't a valid one router will return selected fallback url
         */
        fallback: {
          observer: '__routeObserver'
        },

        /**
         * Array of routes
         */
        routes: {
          value: [],
          observer: '__routeObserver'
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
      merge(options.properties, properties);
      super(options);
    }
    connectedCallback() {
      super.connectedCallback();
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

    __routeObserver() {
      // check if route exists
      // TODO: parseURL & get subroute .
      let route = this.route || this.startRoute;
      if (route && this.routes && this.routes.length > 0) {
        if (this.routes && this.routes.indexOf(route) === -1) {
          route = this.fallback;
        }
        location.hash = this.hashbang ? `!/${route}` : `/${route}`;
        this.routeChange(route)
      }
    }

    go(route) {
      this.route = route;
    }
  };
}
