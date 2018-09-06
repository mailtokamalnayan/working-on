import React, { Component } from 'react';
import './App.css';
import firebase, {auth, provider } from './firebase.js';
import { spawn } from 'child_process';
import { PlusCircle, MinusCircle, LogOut, ArrowRightCircle } from 'react-feather';
import styled from "styled-components";
import Moment from 'react-moment';

const LogoutView = styled.div`
  background-color: #9B51E0;
  color: white;
  height: 100vh;
  text-align: center;
  padding: 1rem;
  display: grid;
  align-items: center;
  justify-items: center;
  background-image: url('./Planes2.png');
  background-repeat: no-repeat;
  background-size: cover;
  > div {
    max-width: 900px;
    line-height: 1.4;
  }
`;

const LogoutHeading = styled.h1`
 margin: 0;
 font-size: 36px;
 @media (min-width: 768px) {
   font-size: 60px;
   font-weight: 600;
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
 max-width: 1140px;
 margin: 1rem auto;
`;

const LogOutBtn = styled.button`
 font-size: 100%;
 color: #9B51E0;
 justify-self: end;
 background: none;
 border: none;
`;

const Form = styled.form`
 height: 400px;
 margin-top: 2rem;
 textarea {
   font-size: 36px;
   width: 100%;
   height: 300px;
   border: none;
   padding: 1rem;
   box-sizing: border-box;
 }
 button {
   float: right;
   font-size: 20px;
   background-color: #9B51E0;
   color: white;
   border-radius: 9999px;
   padding: 0.5rem 1rem;
   font-weight: 600;
   border: 0;
 }
`;
const WorkingBlocks = styled.div`
 ul {
   padding-left: 0;
   @media (min-width: 768px) {
     display: grid;
     grid-template-columns: 1fr 1fr 1fr;
     grid-column-gap: 1rem;
   }
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
  position: relative;
`;

const WorkingHead = styled.div`
 display: grid;
 grid-template-columns: 64px 1fr;
  h3, p {
    margin: 0;
    font-size: 100%;
  }
  time {
    color: rgba(0,0,0,0.5);
  }
  img {
    border-radius: 50%;
  }
`;

const Delete = styled.button`
  background: none;
  border: none;
  position: absolute;
  top: 0.5rem;
  right: 0;
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
    const timeNow = new Date().toUTCString();
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
          <LogOutBtn onClick={this.logout}>Log out <LogOut /></LogOutBtn>
          <Form onSubmit={this.handleSubmit}>
            <textarea type="text" name="currentItem" placeholder={"Hi " + this.state.user.displayName + "! What are you working on?" } onChange={this.handleChange} value={this.state.currentItem} />
            <button> Update <PlusCircle /></button>
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
                        <Moment fromNow>{item.timeNow}</Moment>
                      </div>
                    </WorkingHead>

                    <p>{item.title}</p>

                    {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                    <Delete onClick={() => this.removeItem(item.id)}><MinusCircle color="#9B51E0"/></Delete> : null}
                  </WorkingOn>
                )
              })}
            </ul>  
          </WorkingBlocks>      
        </LoginView>
        :
        <LogoutView>
          <div>
          <LogoutHeading className="animated fadeInUp">Share what you’re currently working on with your friends. And create the social pressure to continue working on...</LogoutHeading>
          <LoginBtn className="animated fadeInUp delayed-animation" onClick={this.login}>Log in to share <ArrowRightCircle /></LoginBtn>
          </div> 
        </LogoutView> 
      }
      </div>
    );
  }
}

export default App;
