
// import './App.css';
import { useEffect, useState } from "react";
import axios from "axios";
import { usePlaidLink } from 'react-plaid-link';

axios.defaults.baseURL = "http://localhost:3000"

function App() {
  const [linkToken, setLinkToken] = useState();

    useEffect(() => {

    async function fetch() {
      const response = await axios.post("/create_link_token");
      setLinkToken(response.data.link_token)
    }
    fetch();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      console.log("Success", public_token, metadata)
    },
  });
  
  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
}

export default App;
