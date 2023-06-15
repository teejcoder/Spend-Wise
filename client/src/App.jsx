// import './App.css';
import { useEffect, useState } from "react";
import axios from "axios";
import { usePlaidLink } from 'react-plaid-link';

axios.defaults.baseURL = "http://localhost:3000"

function App() {
  const [linkToken, setLinkToken] = useState();
  const [publicToken, setPublicToken] = useState();

  useEffect(() => {
    async function fetchLinkToken() {
      const response = await axios.post("/create_link_token");
      setLinkToken(response.data.link_token)
    }
    fetchLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      setPublicToken(public_token)
      console.log("Success", public_token, metadata)
    },
  });

  return publicToken ? (
    <>
      <PlaidAuth publicToken={publicToken} />
      <Transactions publicToken={publicToken} />
      {/* <Balance publicToken={publicToken} /> */}
      {/* <Accounts publicToken={publicToken} /> */}
    </>
  ) : (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
}

function PlaidAuth({ publicToken }) {
  const [account, setAccount] = useState();

  useEffect(() => {
    async function fetchData() {
      try {
        const accessTokenResponse = await axios.post("/exchange_public_token", { public_token: publicToken });
        console.log("accessToken", accessTokenResponse.data.accessToken);

        const authResponse = await axios.post("/auth", { access_token: accessTokenResponse.data.accessToken });
        console.log("auth data ", authResponse.data);

        const accountData = authResponse.data.accounts[0];
        const { name, balances, subtype, account_id } = accountData;

        setAccount({ name, balances, subtype, account_id });
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [publicToken]);
  
  return account && (
    <>

      <p>Account name: {account.name}</p>
      <p>Account account number: {account.account_id}</p>
      <p>Balance: {account.balances.current}</p>
      <p>Subtype: {account.subtype}</p>
    </>
  );
}

/////////////////////////////////////////////////////////////////////
//// TRANSACTION COMPONENT
/////////////////////////////////////////////////////////////////////

function Transactions({ publicToken }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      //retrieve token
      const accessTokenResponse = await axios.post("/exchange_public_token", {
        public_token: publicToken,
      });
      console.log("accessToken", accessTokenResponse.data.accessToken);
      //send token
      const transactionsResponse = await axios.post("/transactions", {
        access_token: accessTokenResponse.data.accessToken,
      });
      console.log("transactions data ", transactionsResponse.data);

      setTransactions(transactionsResponse.data.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return (
    <>
    <button onClick={fetchTransactions} disabled={isLoading}>
      Get Transactions
    </button>
    <button onClick={clearTransactions} disabled={isLoading || transactions.length === 0}>
      Clear Transactions
    </button>
    {isLoading && <p>Loading...</p>}
{transactions.length > 0 ? (
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Category</th>
        <th>Merchant</th>
        <th>Description</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {transactions.map((transaction) => (
        <tr key={transaction.transaction_id}>
          <td>{transaction.date}</td>
          <td>{transaction.category}</td>
          <td>{transaction.merchant_name}</td>
          <td>{transaction.name}</td>
          <td>{transaction.amount}</td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p>No transactions available</p>
)}
  </>
  );
}




// balance componenet
// function Balance({ publicToken }) {
//   const [balance, setBalance] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const fetchBalance = async () => {
//     try {
//       setIsLoading(true);
//       const accessTokenResponse = await axios.post('/exchange_public_token', {
//         public_token: publicToken,
//       });
//       console.log('accessToken', accessTokenResponse.data.accessToken);

//       const balanceResponse = await axios.get('/balance', {
//         params: {
//           access_token: accessTokenResponse.data.accessToken,
//         },
//       });
//       console.log('balance data', balanceResponse.data);

//       setBalance(balanceResponse.data.balance);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearBalance = () => {
//     setBalance([]);
//   };

//   return (
//     <>
//       <button onClick={fetchBalance} disabled={isLoading}>
//         Get Balance
//       </button>
//       <button onClick={clearBalance} disabled={isLoading || balance.length === 0}>
//         Clear Balance
//       </button>
//       {isLoading && <p>Loading...</p>}
//       {balance.length > 0 ? (
//         <div>
//           <h3>Balance</h3>
//           {balance.map((item, index) => (
//             <p key={index}>{item.balance}</p>
//           ))}
//         </div>
//       ) : (
//         <p>No balance available</p>
//       )}
//     </>
//   );
// }


export default App;




// function Accounts() {
//   const [account, setAccount] = useState(null);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     let ignore = false;

//     async function fetchAccounts() {
//       const accounts = await axios.post('/accounts');
//       if (!ignore) {
//         setAccount(accounts.data);
//       }
//     }

//     if (user) {
//       fetchAccounts();
//       return () => {
//         ignore = true;
//       };
//     }
//   }, [user]);

// }


