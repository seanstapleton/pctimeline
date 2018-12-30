import React, { Component } from 'react';
import Masonry from 'react-masonry-component';

const images = [ 'https://images.unsplash.com/photo-1496992293786-f51a5a384c8f?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1486670082170-b54a98edda89?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1466203608968-64a13c78fc58?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1489899386118-f4b931edf195?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1488171449184-94ca5157c964?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1523299430930-662665409fc9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1466112928291-0903b80a9466?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1517183021684-7f9984992079?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1529343615935-9e41f4a955d9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9',
'https://images.unsplash.com/photo-1481214110143-ed630356e1bb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjF9'];

class Gallery extends Component {
    render() {
        return (
            <div style={{ padding: 40 }}>
                <Masonry options={{ columnWidth: '.grid-sizer', gutter: 15 }}>
                    <div className='grid-sizer' style={{ width: "calc(20% - 12px)" }}></div>
                    { images.map((src, idx) => (
                        <img key={idx} src={src} style={{ marginBottom: 15, width: "calc(20% - 12px)" }} />
                    )) }
                </Masonry>
            </div>
        );
    }
}

export default Gallery;
