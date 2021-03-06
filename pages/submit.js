import Link from 'next/link'
import React from 'react'
import Nav from '../components/nav'
import ajaxUtils from '../utils/ajaxUtils'
import encoding from '../utils/encoding'
import makeRPC from '../utils/rpcUtils'
import bson from 'bson'
import isUrl from 'is-url'
import Helmet from 'react-helmet'

class Submit extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }

    async componentDidMount() {
        const key = localStorage.getItem('mintPK');
      
        if (!key) {
            window.location.href = '/signup';
            return;
        }
        
        const secret = encoding.hex2ab(key);
        const publicKey = encoding.toHexString(nacl.sign.keyPair.fromSecretKey(secret).publicKey).toUpperCase();
        const user = await ajaxUtils.loadUser(publicKey);
        
        if (!user) {
            window.location.href = '/signup';
            return;
        }

        this.setState({ user });
    }

    submit = e => {
        const title = this.title.value, 
              url = this.url.value,
              text = this.text.value;

        if (!title) {
            return;
        }

        if (url && !isUrl(url)) {
            return;
        }

        const secret = encoding.hex2ab(localStorage.getItem('mintPK'));
        const publicKey = nacl.util.encodeBase64(nacl.sign.keyPair.fromSecretKey(secret).publicKey);

        const id = new bson.ObjectID().toString();

        let txBody = { 
            type: "createPost",
            entity: {
                id: id,
                title: title,
                url: url,
                text: text,
                author: this.state.user.username
            } 
        }

        makeRPC(txBody, publicKey, secret, function(){
            window.location.href = '/post?id=' + id;
        });
    }

    render() {
        return (
            <div>
                <Nav user={this.state.user} />
                <Helmet title="Share a news or start a discussion" />
                <div className="post-list">
                    <div className="container">
                        <div className="ask-wrapper">
                            <div className="single-field d-flex flex-row align-items-center">
                                <div className="label">
                                    title
                                </div>
                                <div className="input-wrapper">
                                    <input type="text" ref={c => { this.title = c }}/>
                                </div>
                            </div>
                            <div className="single-field d-flex flex-row align-items-center">
                                <div className="label">
                                    url
                                </div>
                                <div className="input-wrapper">
                                    <input type="text"  ref={c => { this.url = c }}/>
                                </div>
                            </div>
                            <div className="separator">or</div>
                            <div className="single-field d-flex flex-row align-items-center">
                                <div className="label">
                                    text
                                </div>
                                <div className="input-wrapper">
                                    <textarea ref={c => { this.text = c }} ></textarea>
                                </div>
                            </div>
                            <div className="submit-wrapper">
                                <button className="btn btn-primary" onClick={this.submit}>Submit</button>
                            </div>
                            <div className="side-note">
                                <p>Leave url blank to submit a question for discussion. If there is no url, the text (if any) will appear at the top of the thread.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Submit