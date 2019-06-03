import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Routes
import Routes from './routes/Routes';

function app() {
    return (
        <Router>
            <Routes/>
        </Router>
    );
}

export default app;
