import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

// Axios
import axios from '../../../services/axios.service';

class Logout extends Component {

    state ={
        redirectOnLogout: null,
    }

    componentDidMount() {
        axios.post('/logout')
        .then(res => {
            localStorage.removeItem('user');
            this.setState({ redirectOnLogout: true });
        })
        .catch(err => {
        });
    }

    render() {
        const { redirectOnLogout } = this.state;
        let content = redirectOnLogout && <Redirect to='/login'/> || (
            <div>Logging out...</div>
        )

        return content;
    }
}

export default Logout;