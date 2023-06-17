import "./App.css";
import axios from "axios";
import Navbar from "./components/Navbar";
import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';


axios.defaults.baseURL = "http://localhost:3000"

function App() {

    const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState([]);
  
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log(error)
    });
  
    useEffect(
        () => {
            if (user) {
                axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                      console.log(res.data)
                      setProfile(res.data);
                    })
                    .catch((err) => console.log(err));
            }
        },
        [ user ]
    );
  
    // log out function to log the user out of google and set the profile array to null
    // const logOut = () => {
    //     googleLogout();
    //     setProfile(null);
    // };



    // <div>
    //     <img src={profile.picture} alt="user image" />
    //         <p>Hi, {profile.given_name}</p>
    // <br />
    //     <button onClick={logOut}>Log out</button>
    // </div>

    return (
        <>
            <Navbar />

            <div className="login">
                <section className="loginHero">

                    <button className="gmailSignin" onClick={() => login()}>Sign in with Google 🚀 </button>

                </section>
            </div>

        </>
    )

};

export default App;