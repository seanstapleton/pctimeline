import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    padding: 10px;
    opacity: 0.8;
    overflow: auto;
`;
const Logo = styled.h1`
    font-size: 1.5em;
    font-family: 'Open Sans';
    font-weight: 200;
    padding: 0 20px;
    color: #fff;
    float: left;
`;
const LinkContainer = styled.ul`
    list-style-type: none;
    float: right;
    padding: 0 20px;
`;
const Link = styled.li`
    font-size: 1.5em;
    font-family: 'Open Sans';
    font-weight: 200;
    float: left;
    color: #fff;
`;

class Header extends Component {
  render() {
    return (
      <Container className="header">
        <Logo>ΦΧΘ Timeline</Logo>
        <LinkContainer>
            <Link>Upload</Link>
        </LinkContainer>
      </Container>
    );
  }
}

export default Header;
