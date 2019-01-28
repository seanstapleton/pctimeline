import React, { Component } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const Container = styled.div`
    overflow: auto;
    line-height: calc(1.5em + 20px);
`;
const CenteredSubContainer =  styled.div`
    display: block;
    width: 90vw;
    margin: 0 auto;
    max-width: 1000px;

    @media(min-width: 768px) {
        width: 80vw;
    }
`;
const Logo = styled.h1`
    font-size: 1.5em;
    font-family: 'Open Sans';
    font-weight: 200;
    padding: 0;
    color: #fff;
    float: left;
    & a {
        text-decoration: none;
        color: ${props => props.textColor || '#fff'};
    }
`;
const NavLinkContainer = styled.ul`
    list-style-type: none;
    float: right;
    padding: 0;
`;
const NavLink = styled.li`
    font-size: 1.25em;
    font-family: 'Open Sans';
    font-weight: 200;
    float: left;
    & a {
        text-decoration: none;
        color: ${props => props.textColor || '#fff'};
        padding: 5px 20px;
        // line-height: calc(1.5em + 20px);
        border-radius: 5px;
        background-color: #B180E8;
        opacity: 0.9;
    }
`;

class Header extends Component {
  render() {
    const { textColor } = this.props;

    return (
      <Container className="header">
        <CenteredSubContainer>
            <Logo textColor={textColor}><Link to='/'>ΦΧΘ Timeline</Link></Logo>
            <NavLinkContainer>
                <NavLink textColor={textColor}><Link to='/upload'>Upload</Link></NavLink>
            </NavLinkContainer>
        </CenteredSubContainer>
      </Container>
    );
  }
}

export default Header;
