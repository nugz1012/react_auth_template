import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// Axios
import axios from '../../../services/axios.service';

class Authenticated extends Component {

    state = {
        secretClickCount: 0
    }

    handleSecretClick = async () => {
        let i = 0;
        while (i < 5) {
            axios.get('/secret', { params: { test: 123 } })
            .then((res) => {
                console.log('File: Authenticated.js', 'Line: 18', res);
                this.setState((state, props) => ({ secretClickCount: state.secretClickCount + 1 }));
            }).catch((err) => {
                // console.log('File: Authenticated.js', 'Line: 21', err.response)
            });

            i++
        }
    }

    render() {
        const { secretClickCount } = this.state;
    
        return (
            <div>
                <div style={{ marginBottom: 12 }}>Woot your in! </div>
                <div style={{ display: 'flex', marginBottom: 12 }}>
                    <button onClick={this.handleSecretClick}>Something secret!</button>
                    <div style={{ marginLeft: 12 }}>{ secretClickCount } </div>
                </div>
                <div>
                    <Link to='/logout'>Logout</Link>
                </div>
            </div>
        );
    }
}

export default Authenticated;