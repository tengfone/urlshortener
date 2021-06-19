import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header'

// Pages
import HomePage from './pages/Homepage'
import AboutPage from './pages/Aboutpage'
import RedirectPage from './pages/Redirectpage.js'

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Switch>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route path='/about'>
            <AboutPage />
          </Route>
          <Route path='/:ShortURL'>
            <RedirectPage />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
