import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import * as s from "./styles/globalStyles";
import _color from "./assets/images/bg/335396.jpg";
import "./assets/css/bootstrap.css";
import Web3 from "web3";
import InsuranceContract from "./contracts/Insurance.json";

function App() {
  const [loading, setLoading] = useState(false);
  const [authorised,setAuthorised]=useState(false);
  const [amount, setAmount] = useState();
  const [time, setTime] = useState("");
  const [price,setPrice]=useState();
  const [dep,setDep]=useState(false);

  const connect = async() => {
      if (window.ethereum) {
        let web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const insur = new web3.eth.Contract(
              InsuranceContract,
              "0xb366B08749673Feeb4069f5114A7dBf592567072"
            );
            console.log(accounts);
            console.log(insur);
            setAuthorised(true);
            let c=await insur.methods.price().call();
            setPrice(c);


            // Add listeners start
            window.ethereum.on("chainChanged", () => {
              window.location.reload();
            });
        } catch (err) {
          console.log("Something went wrong.");
        }
      } else {
        console.log("Install Metamask.");
      }
  };

  const deposit = async()=>{
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    let web3 = new Web3(window.ethereum);
    const insur = new web3.eth.Contract(
      InsuranceContract,
      "0xb366B08749673Feeb4069f5114A7dBf592567072"
    );
      await insur.methods.deposit(amount,time).send(
        {
          from:accounts[0],
          value:amount
        }
      )
      let options = {
        filter: {
            value: [],
        },
        fromBlock: 0
    };
    
    insur.events.Deposited(options)
        .on('data', event => console.log(event))
      setDep(true);

  }


  useEffect(() => {
 
  }, []);

  return (
    <s.Screen image={_color}>
      { !authorised ? (
        <s.Container flex={1} ai={"center"} jc={"center"}>
          <div className="h1 fw-bold text-white card p-3 rounded-3 bg-dark shadow">
            💸 Enter insurETH 💸 
          </div>
          <s.SpacerSmall />
          <button
            className="btn btn-primary fw-bold"
            onClick={(e) => {
              e.preventDefault();
              connect();
            }}
          >
            CONNECT YOUR WALLET
          </button>
        </s.Container>
      ) : !dep ?(
        <div className="p-3">
          <div className="container text-center">
            <div className="text-white h5 my-5 text-center ">
              Welcome to {" "}
              <span className="fw-bold h1 d-block"> 🪙 insurETH 🪙</span>
              <span className="fw-bold h1 d-block"> Current Price of ETH is {price}</span>
            </div>

            <input
              type="number"
              className="bg-dark w-100 p-3 mb-3 text-white form-control rounded"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount of ETH to deposit in WEI"
            />

            <input
              type="number"
              className="bg-dark w-100 p-3 mb-3 text-white form-control rounded"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Time in years"
            />
            <button
              className="btn btn-warning fw-bold w-100 btn-lg"
              disabled={loading ? 1 : 0}
              onClick={(e) => {
                e.preventDefault();
                deposit();
              }}
            >
             DEPOSIT🏦 
            </button>
          </div>
        </div>
      )
      :
     (<div className="badge text-secondary py-4 text-center ">
     <h3 className="fw-bold text-white d-block"> You have made a deposit</h3>
     </div> 
     )
          }

      <div className="badge text-secondary py-4 text-center ">
       <h5 className="fw-bold text-lb">Built by{" "}</h5> 
        <h4 className="fw-bold text-white d-block">
          Surbhit Agrawal
        </h4>
      </div>
    </s.Screen>
  );
}
export default App;

