// Mock for react-router-dom
const reactRouterDom = {
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: () => null,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null
  }),
  Link: ({ children }) => children
};

module.exports = reactRouterDom;