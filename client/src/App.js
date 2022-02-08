import 'bootstrap/dist/css/bootstrap.min.css'
import './css/App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SignUp from './components/signup'
import Home from './components/home'
import Cart from './components/cart'
import Review from './components/review'
import Profile from './components/profile'
import SignIn from './components/signin'
import NotFound from './components/notfound'



function App() {
  return (
    <div className="App">
        <Router>
            <Routes>
                <Route path="/signup" element={<SignUp />} />
                <Route path="/home" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Review />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<SignIn />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    </div>
  );
}

export default App;
