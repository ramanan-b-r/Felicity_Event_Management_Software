import {BrowserRouter, Routes, Route} from 'react-router-dom'
import PartDashboard from './pages/participantdashboard.jsx'
import OrgDashboard from './pages/organizerdashboard.jsx'
import Navbar from './components/navbar'
import Profile from './pages/profile.jsx'
import Logout from './pages/logout.jsx'
import Events from './pages/browseevents.jsx'
import Clubs from './pages/clubs.jsx'
import Login from './pages/login.jsx'
import LandingPage from './pages/landingpage.jsx'
import Register from './pages/register.jsx'
import UserOnboarding from './pages/useronboarding.jsx'
import AdminDashboard from './pages/admindashboard.jsx'
import ManageOrganizers from './pages/manageorganizers.jsx'
import CreateEvent from './pages/createevent.jsx'
function App() {
  return(
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/participantdashboard" element={<PartDashboard/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/events" element={<Events/>}/>
        <Route path="/clubs" element={<Clubs/>}/>
        <Route path="/organizerdashboard" element={<OrgDashboard/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/useronboarding" element={<UserOnboarding/>}/>
        <Route path="/admindashboard" element={<AdminDashboard/>}/>
        <Route path="/manageorganizers" element={<ManageOrganizers/>}/>
        <Route path="/createevent" element={<CreateEvent/>}/>
      </Routes>
    </BrowserRouter>
  )
}
export default App
