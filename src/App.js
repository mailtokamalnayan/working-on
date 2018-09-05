import React, { Component } from 'react';
import './App.css';
import firebase, {auth, provider } from './firebase.js';
import { spawn } from 'child_process';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: [],
      user: null
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
    const item = {
      title: this.state.currentItem,
      user: this.state.user.displayName || this.state.user.email
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
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user
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
        <button onClick={this.logout}>Log out</button>
        :
        <button onClick={this.login}>Log in to get started</button>  
      }
      { this.state.user ?
      <div>
        <img src={this.state.user.photoURL} />
        <h1>Hi {this.state.user.displayName}! What are you working on?</h1>
        <form onSubmit={this.handleSubmit}>
          <input type="text" name="username" placeholder="Enter name:" onChange={this.handleChange} value={this.state.user.displayName || this.state.user.email} />
          <input type="text" name="currentItem" placeholder="What are you working on?" onChange={this.handleChange} value={this.state.currentItem}/>
          <button>Update</button>
        </form>
        <section className="display-item">
          <ul>
            {this.state.items.map((item) => {
              return (
                <li key={item.id}>
                  <h3>{item.title}</h3>
                  <p>{item.user}</p>
                  {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                   <button onClick={() => this.removeItem(item.id)}>Remove Item</button> : null}
                </li>
              )
            })}
          </ul>
        </section>  
      </div>
      :
      <span></span>
    }
      </div>
    );
  }
}

export default App;
