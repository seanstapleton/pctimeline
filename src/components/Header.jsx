import React, { Component } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const Container = styled.div`
    padding: 10px;
    overflow: auto;
`;
const Logo = styled.h1`
    font-size: 1.5em;
    font-family: 'Open Sans';
    font-weight: 200;
    padding: 0 20px;
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
    padding: 0 20px;
`;
const NavLink = styled.li`
    font-size: 1.5em;
    font-family: 'Open Sans';
    font-weight: 200;
    float: left;
    & a {
        text-decoration: none;
        color: ${props => props.textColor || '#fff'};
    }
`;

class Header extends Component {
  render() {
    const { textColor } = this.props;

    return (
      <Container className="header">
        <Logo textColor={textColor}><Link to='/'>ΦΧΘ Timeline</Link></Logo>
        <NavLinkContainer>
            <NavLink textColor={textColor}><Link to='/upload'>Upload</Link></NavLink>
        </NavLinkContainer>
      </Container>
    );
  }
}

export default Header;
