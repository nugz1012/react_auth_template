import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

// Axios
import axios from '../../../services/axios.service';

class Login extends Component {

    state = {
        redirectOnAuth: null,
    }

    // componentDidMount() {
    //     axios.get('/token')
    //     .then(res => {
    //         const { user } = res.data;
    //         localStorage.setItem('user', user.id);
    //         this.setState({ redirectOnAuth: true });
    //     })
    //     .catch(err => {
    //         // console.log('File: Login.js', 'Line: 14', err.response)
    //     });
    // }

    handleLogin = () => {
        axios.post('/login', { user: 'user', password: 'password' })
            .then(res => {
                const { user } = res.data;
                localStorage.setItem('user', user.id);
                this.setState({ redirectOnAuth: true });
            })
            .catch(err => {
                // console.log('File: Login.js', 'Line: 14', err.response)
            });
    }

    render() {
        const { redirectOnAuth } = this.state;
        const { isAuthenticated } = this.props;

        return (
            <div>
                { (isAuthenticated || redirectOnAuth) && <Redirect to='/authenticated' /> }
                <div>Unauthenticated</div>
                <button onClick={this.handleLogin}>Login</button>
            </div>
        );
    }
}

export default Login;