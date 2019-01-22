import styled from 'styled-components';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

const Container = styled.div`
    background-color: #bd9cdb;
    width: 100vw;
    height: 100vh;
    padding: 1px;
`;

const LoginBox = styled.div`
    width: calc(90% - 40px);
    display: block;
    margin: 0 auto;
    background-color: rgba(255,255,255,0.4);
    text-align: center;
    padding: 20px;
    border-radius: 10px;
    margin-top: 20vh;
    font-family: 'Open Sans';

    @media (min-width: 768px) {
        width: 40%;
    }
`;

const InputBox = styled.input`
    border: none;
    padding: 10px;
    border-radius: 5px;
    margin-top: 20px;
    width: calc(80% - 20px);

    &:focus {
        outline: none;
    }
`;

const LoginButton = styled.button`
    border: none;
    padding: 10px;
    border-radius: 5px;
    background-color: #A964C4;
    color: #fff;
    font-weight: 100;
    display: block;
    margin: 10px auto;
    width: 80%;
    cursor: pointer;

    &:focus {
        outline: none;
    }
`;

class LoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = { password: '' };

        this.onPasswordChange = this.onPasswordChange.bind(this);
    }

    onPasswordChange(e) {
        this.setState({ password: e.target.value });
    }

    render() {
        const { password } = this.state;
        const {
            authed,
            onLogin
        } = this.props;

        if (authed) {
            return (<Redirect to='/' />)
        }

        return (
            <Container>
            <LoginBox>
                <p>PCTimeline</p>
                <form onSubmit={(e) => {
                    onLogin(password);
                    e.preventDefault();
                }}>
                    <InputBox type='password' placeholder='password' onChange={this.onPasswordChange} />
                    <LoginButton type='submit'>Login</LoginButton>
                </form>
            </LoginBox>
            </Container>
        );
    }
}

export default LoginPage;
