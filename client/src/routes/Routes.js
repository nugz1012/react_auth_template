import React from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';

// COMPONENTS
import Login from '../ui/pages/Login/Login';
import Logout from '../ui/pages/Logout/Logout';
import Authenticated from '../ui/pages/Authenticated/Authenticated';

class Routes extends React.Component {

    state = {
        isAuthenticated: false
    }

    componentDidMount() {
        const isAuthenticated = !!localStorage.getItem('user');        
        this.setState({ isAuthenticated });
    }

    componentDidUpdate() {
        const { location } = this.props;

        const isAuthenticated = !!localStorage.getItem('user');

        // if (!isAuthenticated && location.pathname !== '/login') {
        //     return <Redirect to='/login'/>;
        // } else if (isAuthenticated && location.pathname === '/login') {
        //     return <Redirect to='/authenticated'/>;
        // }
        // test

        if (this.state.isAuthenticated !== isAuthenticated) {
            this.setState({ isAuthenticated });
        }
    }

    render() {
        const { isAuthenticated } = this.state;
        return (
            <Switch>
                <Route exact path='/login' render={() => <Login isAuthenticated={isAuthenticated}/>}/>
                <Route exact path='/logout' component={Logout}/>
                {
                    isAuthenticated && (
                        <React.Fragment>
                            <Route exact path='/authenticated' component={Authenticated}/>
                        </React.Fragment>
                    )
                }
                <Redirect to='/login'/>
            </Switch>
        );
    }
};

export default withRouter(Routes);