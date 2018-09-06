import React, { Component } from 'react';
import './App.css';
import firebase, {auth, provider } from './firebase.js';
import { spawn } from 'child_process';
import styled from "styled-components";

const LogoutView = styled.div`
  background-color: #9B51E0;
  color: white;
  height: 100vh;
  text-align: center;
  padding: 1rem;
  display: grid;
  align-items: center;
`;

const LogoutHeading = styled.h1`
 margin: 0;
 font-size: 36px;
 @media (min-width: 768px) {
   font-size: 48px;
 }
`;

const LoginBtn = styled.button`
  background-color: #222;
  font-size: 20px;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  border: none;
  margin-top: 2rem;
`;

const LoginView = styled.div`
 display: grid;
 padding: 1rem;
`;

const LogOutBtn = styled.button`
 font-size: 100%;
 color: #9B51E0;
 justify-self: end;
`;

const Form = styled.form`
 height: 400px;
 textarea {
   margin-top: 1rem;
   font-size: 36px;
   font-weight: 500;
   width: 95%;
   height: 300px;
 }
`;
const WorkingBlocks = styled.div`
 ul {
   padding-left: 0;
 }
`;
const WorkingOn =  styled.li`
  list-style-type: none;
  padding: 1rem;
  background: #FFFFFF;
  border: 1px solid rgba(155, 81, 224, 0.1);
  box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const WorkingHead = styled.div`
 display: grid;
 grid-template-columns: 64px 1fr;
  h3, p {
    margin: 0;
    font-size: 100%;
  }
  p {
    color: rgba(0,0,0,0.5);
  }
  img {
    border-radius: 50%;
  }
`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: [],
      user: null,
      timeNow: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  logout() {
    auth.signOut()
    .then(() => {
      this.setState({
        user: null
      });
    });
  }
  login() {
    auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      this.setState({
        user
      });
    });
  }
  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const timeNow = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    const item = {
      title: this.state.currentItem,
      user: this.state.user.displayName || this.state.user.email,
      userImage: this.state.user.photoURL,
      timeNow: timeNow
    }
    itemsRef.push(item);
    this.setState({
      currentItem: '',
      username: ''
    });
  }
  componentDidMount() {
    // Check if the user is already logged in and save the state across refresh
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      }
    })

    const itemsRef = firebase.database().ref('items');
    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      let timeNow = '';
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user,
          userImage: items[item].userImage,
          timeNow: items[item].timeNow
        });
      }
      this.setState({
        items: newState
      })
    })
  }
  removeItem(itemId) {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
  }
  render() {
    return (
      <div className="App">
        {this.state.user ?
        <LoginView>
          <LogOutBtn onClick={this.logout}>Log out</LogOutBtn>
          <Form onSubmit={this.handleSubmit}>
            <textarea type="text" name="currentItem" placeholder={"Hi " + this.state.user.displayName + "! What are you working on?" } onChange={this.handleChange} value={this.state.currentItem} />
            <button>Update</button>
          </Form>
          <WorkingBlocks>
            <ul>
            {this.state.items.map((item) => {
                return (
                  <WorkingOn key={item.id}>
                    <WorkingHead> 
                      <img width="56px" src={item.userImage} />
                      <div>
                        <h3>{item.user}</h3>
                        <p>{item.timeNow}</p>
                      </div>
                    </WorkingHead>

                    <p>{item.title}</p>

                    {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                    <button onClick={() => this.removeItem(item.id)}><svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.5">
                    <path d="M1 5H3H19" stroke="#9B51E0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 5V3C6 2.46957 6.21071 1.96086 6.58579 1.58579C6.96086 1.21071 7.46957 1 8 1H12C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V5M17 5V19C17 19.5304 16.7893 20.0391 16.4142 20.4142C16.0391 20.7893 15.5304 21 15 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5H17Z" stroke="#9B51E0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    </svg></button> : null}
                  </WorkingOn>
                )
              })}
            </ul>  
          </WorkingBlocks>      
        </LoginView>
        :
        <LogoutView>
          <div>
          <LogoutHeading>Share what you’re working on and feel the pressure to continue working on</LogoutHeading>
          <LoginBtn onClick={this.login}>Log in to commit</LoginBtn>
          </div> 
        </LogoutView> 
      }
      </div>
    );
  }
}

export default App;
