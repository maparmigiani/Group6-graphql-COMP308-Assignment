// App.js
import { gql, useQuery, useMutation } from '@apollo/client';
import { Modal, Navbar, Nav, Container} from 'react-bootstrap';
import React, { useState, Fragment } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Navigate,
  Routes
} from "react-router-dom";
import '../node_modules/font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css'

import logo from './logo30.png';
import './App.css';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Nurses from './components/Nurses';
import Patients from './components/Patients';
import UserProfile from './components/UserProfile';
import ChangePassword from './components/ChangePassword';
import DeleteUser from './components/DeleteUser';

function App() {

  // query for checking if student is logged in
  const PAYLOAD = gql`
query Payload {
  payload{
    username
    email
    userType
  }
}
`;

  const LOGOUT_USER = gql`
mutation Logout
{
	logout
}
`;

  //const [, updateState] = React.useState();
  //const forceUpdate = React.useCallback(() => updateState({}), []);
  const [logoutUser] = useMutation(LOGOUT_USER);

  const [userType, setUserType] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  //ReactModal.setAppElement('#root');

  const NurseProtectedRoute = ({ children }) => {
    if (!isNurse()) {
      return <Navigate to="/login" replace />
    }
    return children;
  }

  const RedirectHomeRoute = ({ children }) => {
    if (isLoggedIn()) {
      return <Navigate to="/home" replace />
    }
    return children;
  }

  const { loading, error, data } = useQuery(PAYLOAD, {
    onCompleted: (data) => {
      console.log(data.payload)
      setUserType(data.payload.userType);
      setUsername(data.payload.username);
      setEmail(data.payload.email);
      sessionStorage.setItem('username', data.payload.username);
    },
  });

  const logout = () => {
    logoutUser()
      .then(() => {
        sessionStorage.clear();
        window.location.href = '/login'
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  /*
  useEffect(() => {
    console.log(isLoggedIn());
    if (isLoggedIn()) {
      console.log('forceUpdate')
      forceUpdate();
    }
    },[]);*/

  const isLoggedIn = () => {
    //console.log(sessionStorage.getItem('username'));
    return sessionStorage.getItem('username') !== undefined
      && sessionStorage.getItem('username') !== ''
      && sessionStorage.getItem('username') !== null;
  }

  const isNurse = () => {
    return isLoggedIn() && userType === 'nurse';
  }

  return (
    <Router>
      <Navbar bg="white" variant="white" expand="md">
        <Container>
          <Navbar.Brand href="home">
            <img
              alt="Logo"
              src={logo}
              className="d-inline-block align-top"
            />{' '}
            Released Patient Care</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/home" >Home</Nav.Link>
              <Nav.Link as={Link} to="/nurses">Contact Nurses</Nav.Link>
              {
                !isLoggedIn() ?
                  <Fragment>
                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  </Fragment>
                  :
                  <Fragment>
                    {isNurse() ?
                      <Fragment><Nav.Link as={Link} to="/patients">Patients</Nav.Link></Fragment>
                      :
                      <Fragment></Fragment>
                    }
                    <div className={`nav-link`} style={{ cursor: "pointer" }} onClick={() => setIsOpen(true)}> Account Settings </div>
                    <Modal show={isOpen} onHide={() => setIsOpen(false)}>
                      <Modal.Header closeButton>
                        <Modal.Title>Account Settings</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <h5>User Profile</h5>
                        <UserProfile username={username} email={email} userType={userType} />
                        <h5>Change Password</h5>
                        <ChangePassword />
                        <h5>Delete Account</h5>
                        <DeleteUser />
                      </Modal.Body>
                      <Modal.Footer></Modal.Footer>
                    </Modal>
                    <div className={`nav-link`} style={{ cursor: "pointer" }} onClick={() => logout()}> Logout {username} ({userType}) </div>
                  </Fragment>
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div>
        <Routes>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="nurses" element={<Nurses />} />
          <Route path="patients" element={<NurseProtectedRoute><Patients /></NurseProtectedRoute>} />
          <Route path="login" element={<RedirectHomeRoute><Login /></RedirectHomeRoute>} />
          <Route path="register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
